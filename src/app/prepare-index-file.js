
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

const readSiteOnChange = async ({site, publicFolder, warn = true, state}) => {
  const fullPath = path.join(publicFolder, site)

  const { siteData: previous, version } = state
  const stat = await readSiteStat({fullPath, site, publicFolder})

  if (previous && (previous.ctime === stat.ctimeMs && previous.mtime === stat.mtimeMs)) {
    previous.refreshed = false
    return previous
  }

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

const readSiteData = async ({site, publicFolder, state}) => {
  if (site) {
    return readSiteOnChange({
      site,
      publicFolder,
      warn: true,
      state
    })
  } else {
    // -- todo.
  }
}

const prepareIndexFile = ({state, site, publicFolder}) => {
  const emitter = new EventEmitter()

  setInterval(async () => {
    state.siteData = await readSiteData({
      site,
      publicFolder,
      state
    })

    if (state.siteData.refreshed) {
      emitter.emit('refresh', state.siteData)
      state.siteData.refreshed = false
    }
  }, 250)

  return emitter
}

module.exports = prepareIndexFile
