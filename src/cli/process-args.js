
const errors = require('@rgrannell/errors')
const constants = require('../shared/constants')

const processArgs = {}

processArgs.port = (port0Arg, port1Arg) => {

  const port0 = parseInt(port0Arg, 10)
  const port1 = parseInt(port1Arg, 10)

  for (const port of [port0, port1]) {
    if (isNaN(port)) {
      throw errors.invalidPort(`${port} port was invalid`, constants.codes.LR_007)
    }

    if (port <= 0 || port > 65535) {
      throw errors.invalidPort(`port ${port} out of allowed range`, constants.codes.LR_007)
    }
  }


  if (port0 === port1) {
    throw errors.identicalPorts('http and wss ports cannot be the same', constants.codes.LR_007)
  }

  return port0
}

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

module.exports = processArgs
