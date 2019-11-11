
const path = require('path')
const execa = require('execa')
const errors = require('@rgrannell/errors')
const express = require('express')
const signale = require('signale')

const launch = {
  staticServer: require('./launch-static-server'),
  wsServer: require('./launch-ws-server'),
  build: require('./launch-build'),
}

const prepareIndexFile = require('./prepare-index-file')

const constants = require('../shared/constants')
const { codes } = require('../shared/constants')
const errUtils = require('../shared/errors')
const processArgs = require('../cli/process-args')

const asEvent = data => {
  return JSON.stringify(data)
}

process.on('unhandledRejection', errUtils.report)


/**
 * Run live-reload with processed arguments.
 *
 * @param {Object} args arguments supplied to live-reload after processing.
 */
const liveReload = async args => {
  const pids = {}

  const state = {
    version: 0
  }

  launch.staticServer(state, args.publicFolder, args.ports.http)
  launch.build(pids, args.hide, args.build)

  const contentChange = prepareIndexFile({
    pids,
    state,
    site: args.site,
    publicFolder: args.publicFolder
  })

  const wss = await launch.wsServer(state, args.ports.wss)

  const {events} = constants

  wss.on(events.connection, ws => {
    contentChange.on(events.refresh, () => {
      ws.send(asEvent({
        tag: constants.tags.refresh
      }))
    })
  })

  wss.on(events.message, event => {
    signale.info(`${event.version} is running in browser`)
  })
}

/**
 * Run the live-reload applications
 *
 * @param {Object} rawArgs arguments provided by the docopt interface
 */
const callApplication = async rawArgs => {
  const args = {
    build: await processArgs.build(rawArgs['--build']),
    site: processArgs.site(rawArgs['--site']),
    publicFolder: processArgs.publicFolder(rawArgs['--public_folder']),
    ports: {
      http: processArgs.port(rawArgs['--http_port'], rawArgs['--wss_port']),
      wss: processArgs.port(rawArgs['--wss_port'], rawArgs['--http_port'])
    },
    hide: {
      stdout: rawArgs['hide-build-stdout'],
      stderr: rawArgs['hide-build-stderr']
    }
  }

  await liveReload(args)
}

module.exports = callApplication
