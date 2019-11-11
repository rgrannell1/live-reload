
const fs = require('fs')
const path = require('path')
const errors = require('@rgrannell/errors')
const constants = require('../shared/constants')
const { codes } = require('../shared/constants')

const processArgs = {}

/**
 * Process and validate port arguments supplied.
 *
 * @param {string} port0Arg the first port argument
 * @param {string} port1Arg the second port argument
 *
 * @returns {number} the first port argument, processed
 */
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
 * process the build argument supplied to live-reload
 *
 * @param {string} buildArg the shell-script to run for a build.
 *
 * @returns {string} the build argument
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

  const pkg = require(packagePath)

  if (!pkg.hasOwnProperty('scripts')) {
    throw errors.buildMissing('no build command provided, and "package.json" in current directory has no scripts section', codes.LR_002)
  }

  if (!pkg.scripts.hasOwnProperty('build')) {
    throw errors.buildMissing('no build command provided, and "package.json" in current directory has no build script', codes.LR_003)
  }

  return pkg.scripts.build
}

processArgs.site = siteArg => {
  return siteArg
}

processArgs.publicFolder = publicFolderArg => {
  return path.resolve(publicFolderArg)
}

module.exports = processArgs
