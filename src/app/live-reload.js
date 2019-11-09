
const path = require('path')
const execa = require('execa')
const fs = require('fs')
const errors = require('@rgrannell/errors')
const signale = require('signale')
const {codes} = require('../shared/constants')

// TODO intercept signal codes and propegate

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
    throw errors.buildMissing('no "package.json" file found in current directory', codes.LR_001)
  }

  const package = require(packagePath)

  if (!package.hasOwnProperty('scripts')) {
    throw errors.buildMissing('"package.json" in current directory has no scripts section', codes.LR_002)
  }

  if (!package.scripts.hasOwnProperty('build')) {
    throw errors.buildMissing('"package.json" in current directory has no build script', codes.LR_003)
  }

  return package.scripts.build
}

processArgs.site = () => {

}

const launchBuild = (pids, buildArg) => {
  pids.build = execa(buildArg)

  pids.build.stdout.pipe(process.stdout)
  pids.build.stderr.pipe(process.stderr)
}

const liveReload = async args => {
  let pids = {}

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

  launchBuild(pids, args.build)

  // watch
}

const callApplication = async rawArgs => {
  const args = {
    build: await processArgs.build(rawArgs['--build']),
    site: processArgs.site(rawArgs['--site'])
  }
  console.log(args)

  liveReload(args)
}

module.exports = callApplication
