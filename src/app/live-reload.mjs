
import * as path from 'path'
import signale from 'signale'
import dotenv from 'dotenv'
import koremutake from '../shared/koremutake.mjs'
import prepareIndexFile from './prepare-index-file.mjs'

import apiServer from './launch-api-server.mjs'
import staticServer from './launch-static-server.mjs'
import wsServer from './launch-ws-server.mjs'
import build from './launch-build.mjs'

const launch = {
  apiServer,
  staticServer,
  wsServer,
  build
}

import constants from '../shared/constants.mjs'
import errUtils from '../shared/errors.mjs'
import processArgs from '../cli/process-args.mjs'

/**
 * Stringify JSON data
 *
 * @param data {Object} JSON data
 *
 * @returns {string}
 */
const asEvent = data => {
  return JSON.stringify(data)
}

process.on('unhandledRejection', errUtils.report)

const eventHandlers = {}

/**
 * Handle a websockect connection-opened event
 *
 * @param {Object} state the application state
 * @param {Object} event a connection event
 *
 */
eventHandlers.connectionOpen = (state, event) => {
  if (state.session !== event.session) {
    signale.warn(`expected connection from session ${state.session} but received from session ${event.session}`)
  }

  const expected = `v${state.version}`
  if (event.version === expected) {
    signale.info(`${event.version} is running in browser`)
  } else {
    signale.warn(`${event.version} is running in the browser, but it should run ${expected}`)
  }
}

const handleBrowserMessages = state => event => {
  if (eventHandlers.hasOwnProperty(event.tag)) {
    eventHandlers[event.tag](state, event)
  } else {
    throw new Error(`message with unsupported tag ${event.tag} received from browser`)
  }
}

eventHandlers.serviceWorkerUnregistered = (state, event) => {
  signale.warn('live-reload disabled service-workers to prevent caching')
}

eventHandlers.serviceWorkerDetectedAfterUnregister = (state, event) => {
  signale.warn('failed to unregister service-workers')
}

const serveSite = async (state, args, pids) => {
  launch.staticServer(state, args.site.publicDir, args.site.ports.http)

  const contentChange = prepareIndexFile({
    pids,
    state,
    watch: args.site.watch,
    site: args.site.path,
    publicDir: args.site.publicDir
  })

  const wss = await launch.wsServer(state, args.site.ports.wss)
  const { events } = constants

  wss.on(events.connection, ws => {
    contentChange.on(events.refresh, () => {
      ws.send(asEvent({
        tag: constants.tags.refresh
      }))
    })
  })

  wss.on(events.message, handleBrowserMessages(state))
}

const serveApiServer = async (state, args, pids) => {
  if (args.api && args.api.path) {
    dotenv.config()
  }

  launch.apiServer(state, args.api.path, args.api.port)
}

/**
 * Run live-reload with processed arguments.
 *
 * @param {Object} args arguments supplied to live-reload after processing.
 */
const liveReload = async args => {
  const pids = {}

  const state = {
    version: 0,
    session: koremutake()
  }

  for (const build of args.build) {
    const hide = {
      stderr: build.stderr || true,
      stdout: build.stdout || true
    }

    launch.build(pids, hide, build)
  }

  if (args.site) {
    await serveSite(state, args, pids)
  }/**
 *
 */


  if (args.api) {
    await serveApiServer(state, args, pids)
  }
}

/**
 * Run the live-reload application
 *
 * @param {Object} rawArgs arguments provided by the docopt interface
 *
 * @returns {Promise<>} a result promise
 */
const callApplication = async rawArgs => {
  let args;

  if (rawArgs['--package']) {
    const packageLocation = path.join(process.cwd(), './package.json')
    return import(packageLocation).then(packageJson => {

      args = processArgs.package(packageJson.default)
      return liveReload(args)
    })
  }

  await liveReload(args)
}

export default callApplication
