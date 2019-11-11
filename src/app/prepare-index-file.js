
const path = require('path')
const EventEmitter = require('events')

const fsp = require('../shared/fsp')
const processHtml = require('./process-html')
const constants = require('../shared/constants')

const readSite = async (fpath, state, warn = true) => {
  const cwd = process.cwd()
  const fullPath = path.join(cwd, fpath)

  const { siteData: previous, version } = state

  try {
    var stat = await fsp.stat(fullPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      const thrown = errors.fileNotFound(`${fpath} not found (${cwd})`, codes.LR_005)
      thrown.warn = true

      throw thrown
    } else {
      console.log(err)
    }
  }

  if (previous && (previous.ctime === stat.ctimeMs && previous.mtime === stat.mtimeMs)) {
    previous.refreshed = false
    return previous
  }

  let refreshed = false

  try {
    var content = await fsp.readFile(fullPath)
    state.version++
    refreshed = true

  } catch (err) {
    if (err.code === 'ENOENT') {
      const thrown = errors.fileNotFound(`${fpath} not found (${cwd})`, codes.LR_005)
      thrown.warn = true

      throw thrown
    } else {
      try {
        var content = await fsp.readFile(fullPath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          const thrown = errors.fileNotFound(`${fpath} not found (${cwd})`, codes.LR_005)
          thrown.warn = true

          throw thrown
        } else {
          console.log(err)
        }
      }

      console.log(err)
    }
  }

  return {
    refreshed,
    content: await processHtml(fpath, content.toString(), state),
    fpath,
    ctime: stat.ctimeMs,
    mtime: stat.mtimeMs
  }
}

const readSiteData = async (siteArg, state, defaults) => {
  if (siteArg) {
    return readSite(siteArg, state)
  } else {
    // todo
    let result = null
    for (const fpath of defaults) {
      try {
        result = await readSite(fpath)
        break
      } catch (err) {

      }
    }
  }
}

const prepareIndexFile = (pids, state, siteArg) => {
  const emitter = new EventEmitter()

  setInterval(async () => {
    state.siteData = await readSiteData(siteArg, state, constants.sitePaths)

    if (state.siteData.refreshed) {
      emitter.emit('refresh', state.siteData)
      state.siteData.refreshed = false
    }
  }, 250)

  return emitter
}

module.exports = prepareIndexFile
