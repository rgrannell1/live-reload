
const path = require('path')
const execa = require('execa')
const fs = require('fs')
const fsp = require('fs').promises
const errors = require('@rgrannell/errors')
const signale = require('signale')
const express = require('express')
const WebSocket = require('ws')

const processHtml = require('./process-html')

const constants = require('../shared/constants')
const {codes} = require('../shared/constants')
const errUtils = require('../shared/errors')

process.on('unhandledRejection', errUtils.report)

const processArgs = {}

/**
 *
 *
 * @param {string} buildArg the shell-script to run for a build.
 */
processArgs.build = async buildArg => {
  const hasBuildArg = buildArg && buildArg.length > 0

  if (hasBuildArg) {
    return buildArg
  }

  const packagePath = path.join(process.cwd(), 'package.json')

  try {
    await new Promise((resolve, reject) => {
      fs.exists(packagePath, resolve)
    })
  } catch (err) {
    throw errors.buildMissing('no build command provided, and no "package.json" file found in current directory', codes.LR_001)
  }

  const package = require(packagePath)

  if (!package.hasOwnProperty('scripts')) {
    throw errors.buildMissing('no build command provided, and "package.json" in current directory has no scripts section', codes.LR_002)
  }

  if (!package.scripts.hasOwnProperty('build')) {
    throw errors.buildMissing('no build command provided, and "package.json" in current directory has no build script', codes.LR_003)
  }

  return package.scripts.build
}

const detectSite = async siteArg => {
  let targetSite = null

  for (const file of constants.sitePaths) {
    const exists = await new Promise((resolve, reject) => {
      fs.exists(file, resolve)
    })

    if (exists) {
      targetSite = file
      break
    }
  }

  if (!targetSite) {
    throw errors.siteMissing('all candidate sites missing after build', codes.LR_003)
  }
}

const buildExit = {}

buildExit.error = err => {
  throw errors.buildError(`build process exited with non-zero status.\n\n${err.message}`, codes.LR_004)
}

buildExit.success = () => {
  throw errors.buildExit(`build succeed but exited; live-reload builds should watch for file-changes persistantly`, codes.LR_004)
}

/**
 *
 * @param {Object} pids
 * @param {string} buildArg
 */
const launchBuild = (pids, buildArg) => {
  const build = execa.command(buildArg)
    .then(buildExit.success)
    .catch(buildExit.error)

  pids.build = build
}

const readSite = async (fpath, state, warn = true) => {
  const cwd = process.cwd()
  const fullPath = path.join(cwd, fpath)

  const { siteData: previous, version} = state

  try {
    var stat = await fsp.stat(fpath)
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
    return previous
  }

  try {
    var content = await fsp.readFile(fpath)
    state.version++

  } catch (err) {
    if (err.code === 'ENOENT') {
      const thrown = errors.fileNotFound(`${fpath} not found (${cwd})`, codes.LR_005)
      thrown.warn = true

      throw thrown
    } else {
      try {
        var content = await fsp.readFile(fpath)
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

const serveIndex = state => (req, res) => {
  if (state && state.siteData && state.siteData.content && state.siteData.content.source) {
    res.send(state.siteData.content.source)
  } else {
    console.log(state)
  }
}

const launchWsServer = async state => {
  const wss = new WebSocket.Server({
    port: 4001
  })

  wss.on('connection', ws => {
    ws.on('message', message => {
      console.log('foop.')
    })

    ws.send('something')
  })
}

const launchStaticServer = async state => {
  const app = express()
  const port = 4000

  app.get('/', serveIndex(state))

  app.use(express.static('.'))

  app.listen(port, () => {
    signale.info(`live-reload running http://localhost:${port}`)
  })


}

const launchSite = async (pids, state, siteArg) => {
  setInterval(async () => {
    state.siteData = await readSiteData(siteArg, state, constants.sitePaths)
  }, 250)
}

/**
 * Run live-reload with processed arguments.
 *
 * @param {Object} args arguments supplied to live-reload after processing.
 */
const liveReload = async args => {
  let pids = {}

  const state = {
    version: 0
  }

  launchWsServer(state)
  launchStaticServer(state)
  launchBuild(pids, args.build)
  launchSite(pids, state, args.site)
}

/**
 * Run the live-reload applications
 *
 * @param {Object} rawArgs arguments provided by the docopt interface
 */
const callApplication = async rawArgs => {
  const args = {
    build: await processArgs.build(rawArgs['--build']),
    site: rawArgs['--site']
  }

  await liveReload(args)
}

module.exports = callApplication
