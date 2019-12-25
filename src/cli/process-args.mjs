
import errors from '@rgrannell/errors'
import constants from '../shared/constants.mjs'
const { codes } = constants
import jsonSchema from 'jsonschema'

const processArgs = {}

const schemas = {}

/*
 * the configuration for a build item
 */
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

/*
 * The expected api schema
 */
schemas.api = {
  type: 'object',
  required: ['path', 'watch'],
  properties: {
    path: {
      type: 'string'
    },
    port: {
      type: 'number'
    },
    env: {
      type: 'object',
      properties: {
        path: {
          type: 'string'
        },
        vars: {
          type: 'object'
        }
      }
    }
  }
}

/*
 * The expected site schema
 */
schemas.site = {
  type: 'object',
  required: ['path', 'publicDir', 'watch'],
  properties: {
    path: {
      type: 'string'
    },
    publicDir: {
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

/*
 * The expected package json schema
 */
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

/**
 * Ensure the package.json contains the expected content
 *
 * @param {Object} packageJson the package.json configuration
 *
 * @returns {Object} configuration
 */
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
