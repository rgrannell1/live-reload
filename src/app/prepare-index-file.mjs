
import * as path from 'path'
import chokidar from 'chokidar'
import EventEmitter from 'events'
import errors from '@rgrannell/errors'

import fsp from '../shared/fsp'
import processHtml from './process-html'
import constants from '../shared/constants'
const { codes } = constants

/**
 * Read the site's file state
 *
 * @param {string} config.fullPath the path of the site
 * @param {string} config.site the name of the site
 * @param {string} config.publicFolder the folder searched
 */
const readSiteStat = async ({ fullPath, site, publicFolder }) => {
  try {
    return await fsp.stat(fullPath)
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

const readSite = async ({ site, fullPath, publicFolder, state }) => {
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

/**
 * Was the index file edited?
 *
 * @param {Object} stat stats for the index file
 * @param {Object | undefined} previous stats for the previously loaded file
 */
const hasSameEditTimes = (stat, previous) => {
  if (!previous) {
    return false
  }

  const hasSameCtime = previous.ctime === stat.ctimeMs
  const hasSameMtime = previous.mtime === stat.mtimeMs

  return hasSameCtime && hasSameMtime
}

const readSiteOnChange = async ({ site, publicFolder, state }) => {
  const fullPath = path.join(publicFolder, site)

  const { siteData: previous } = state
  const stat = await readSiteStat({ fullPath, site, publicFolder })

  if (hasSameEditTimes(stat, previous)) {
    previous.refreshed = false
    return previous
  } else {
    const { refreshed, content } = await readSite({
      site,
      fullPath,
      publicFolder,
      state
    })

    return {
      refreshed,
      content: await processHtml(site, content.toString(), state),
      fpath: site,
      publicFolder,
      ctime: stat.ctimeMs,
      mtime: stat.mtimeMs
    }
  }
}

const prepareIndexFile = ({ state, watch, site, publicFolder }) => {
  console.log(EventEmitter )
  console.log(EventEmitter )
  console.log(EventEmitter )
  console.log(EventEmitter )
  const emitter = new EventEmitter()

  const { events } = constants

  const watcher = chokidar.watch(watch, {
    persistent: true
  })

  watcher.on('all', async (event, fpath) => {
    const siteData = await readSiteOnChange({
      site,
      publicFolder,
      state
    })

    if (siteData.refreshed) {
      emitter.emit(events.refresh, siteData)
      siteData.refreshed = false
    }

    state.siteData = siteData
  })

  return emitter
}

export default prepareIndexFile
