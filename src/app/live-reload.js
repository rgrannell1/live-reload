
const path = require('path')
const execa = require('execa')
const fs = require('fs')
const errors = require('@rgrannell/errors')
const signale = require('signale')
const constants = require('../shared/constants')
const {codes} = require('../shared/constants')

process.on('unhandledRejection', err => {
  const message = `${err.name}/${err.code}: ${err.message}`
  signale.fatal(message)
  process.exit(1)
})

const processArgs = {}

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

//  pids.build.stdout.pipe(process.stdout)
//  pids.build.stderr.pipe(process.stderr)
}

const attachSignalHandlers = pids => {
  process.on('SIGKILL', () => {
    subprocess.kill('SIGTERM', {
      forceKillAfterTimeout: 1 * 1000
    })
  })

  process.on('SIGINT', () => {
    subprocess.kill('SIGTERM', {
      forceKillAfterTimeout: 4 * 1000
    })
  })
}

/**
 * Run live-reload with processed arguments.
 *
 * @param {Object} args arguments supplied to live-reload after processing.
 */
const liveReload = async args => {
  let pids = {}

//  attachSignalHandlers(pids)

  launchBuild(pids, args.build)

  // watch
}

/**
 * Run the live-reload application
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
