
import * as fs from 'fs'
import * as path from 'path'
import errors from '@rgrannell/errors'
import constants from '../shared/constants'
const { codes } = constants
import jsonSchema from 'jsonschema'

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

const schemas = {}

schemas.buildItem = {
  anyOf: [
    {
      type: 'string'
    },
    {
      type: 'object',
      required: ['command'],
      properties: {
        command: {
          type: 'string'
        },
        hideStdout: {
          type: 'boolean'
        },
        hideStderr: {
          type: 'boolean'
        }
      }
    }
  ]
}

schemas.api = {
  type: 'object',
  required: [],
  properties: {

  }
}

schemas.site = {
  type: 'object',
  required: ['path', 'publicFolder', 'watch'],
  properties: {
    path: {
      type: 'string'
    },
    publicFolder: {
      type: 'string'
    },
    watch: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    ports: {
      type: 'object',
      properties: {
        http: {
          type: 'number',
          minimum: 0,
          maximum: 65535
        },
        wss: {
          type: 'number',
          minimum: 0,
          maximum: 65535
        }
      }
    }
  }
}

const packageSchema = {
  id: '/package',
  type: 'object',
  anyOf: [
    {
      required: ['site']
    },
    {
      required: ['api']
    }
  ],
  properties: {
    build: {
      type: 'array',
      items: schemas.buildItem
    },
    site: schemas.site,
    api: schemas.api
  }
}

processArgs.package = packageJson => {
  if (!packageJson['live-reload']) {
    throw errors.missingConfig('no "live-reload" configuration found in package.json', codes.MISSING_CONFIG)
  }

  const config = packageJson['live-reload']
  const report = jsonSchema.validate(config, packageSchema)

  const message = report.errors.map(error => {
    return `${error.message} (${error.schema})`
  }).join('\n')

  if (message) {
    throw errors.invalidConfig(message)
  }

  if (!config.build) {
    config.build = []
  }

  if (config.site && !config.site.ports) {
    config.site.ports = {
      http: constants.ports.http,
      wss: constants.ports.wss
    }
  }

  return config
}

export default processArgs
