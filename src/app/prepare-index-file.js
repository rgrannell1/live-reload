
const path = require('path')
const EventEmitter = require('events')

const fsp = require('../shared/fsp')
const processHtml = require('./process-html')
const constants = require('../shared/constants')

const readSiteStat = ({ fullPath, site, publicFolder }) => {
  try {
    return fsp.stat(fullPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      const thrown = errors.fileNotFound(`${site} not found (${publicFolder})`, codes.LR_005)
      thrown.warn = true

      throw thrown
    } else {
      console.log(err)
    }
  }
}

const readSite = async ({site, fullPath, publicFolder,state}) => {
  let refreshed = false

  try {
    var content = await fsp.readFile(fullPath)
    state.version++
    refreshed = true
  } catch (err) {
    if (err.code === 'ENOENT') {
      const thrown = errors.fileNotFound(`${site} not found (${publicFolder})`, codes.LR_005)
      thrown.warn = true

      throw thrown
    } else {
      console.error(err)
    }
  }

  return {
    refreshed,
    content
  }
}

const hasSameEditTimes = (stat, previous) => {
  if (!previous) {
    return false
  }

  const hasSameCtime = previous.ctime === stat.ctimeMs
  const hasSameMtime = previous.mtime === stat.mtimeMs

  return hasSameCtime && hasSameMtime
}

const readSiteOnChange = async ({site, publicFolder, warn = true, state}) => {
  const fullPath = path.join(publicFolder, site)

  const { siteData: previous, version } = state
  const stat = await readSiteStat({fullPath, site, publicFolder})

  if (hasSameEditTimes(stat, previous)) {
    previous.refreshed = false
    return previous
  } else {
    const {refreshed, content} = await readSite({
      site,
      fullPath,
      publicFolder,
      state
    })

    return {
      refreshed,
      content: await processHtml(site, content.toString(), state),
      fpath: site,
      ctime: stat.ctimeMs,
      mtime: stat.mtimeMs
    }
  }
}

const prepareIndexFile = ({state, site, publicFolder}) => {
  const emitter = new EventEmitter()

  const {events} = constants

  setInterval(async () => {
    const siteData = await readSiteOnChange({
      site,
      publicFolder,
      state,
      warn: true
    })

    if (siteData.refreshed) {
      emitter.emit(events.refresh, siteData)
      siteData.refreshed = false
    }

    state.siteData = siteData
  }, constants.intervals.updateIndexFile)

  return emitter
}

module.exports = prepareIndexFile
