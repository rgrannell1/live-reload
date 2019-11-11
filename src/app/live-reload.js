
const path = require('path')
const execa = require('execa')
const errors = require('@rgrannell/errors')
const express = require('express')
const signale = require('signale')

const launchStaticServer = require('./launch-static-server')
const launchWsServer = require('./launch-ws-server')
const prepareIndexFile = require('./prepare-index-file')

const constants = require('../shared/constants')
const { codes } = require('../shared/constants')
const errUtils = require('../shared/errors')
const processArgs = require('../cli/process-args')

process.on('unhandledRejection', errUtils.report)

const buildExit = {}

buildExit.error = err => {
  throw errors.buildError(`build process exited with non-zero status.\n\n${err.message}`, codes.LR_004)
}

buildExit.success = () => {
  throw errors.buildExit('build succeed but exited; live-reload builds should watch for file-changes persistantly', codes.LR_004)
}

/**
 *
 * @param {Object} pids
 * @param {string} buildArg
 */
const launchBuild = (pids, buildArg) => {
  // -- builds are continuous so we can't block with 'await'
  // -- promise rejections will be unhandled though
  const build = execa.command(buildArg)
    .then(buildExit.success)
    .catch(buildExit.error)

  pids.build = build
}

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

  launchStaticServer(state, args.ports.http)
  launchBuild(pids, args.build)
  const contentChange = prepareIndexFile(pids, state, args.site)

  const wss = await launchWsServer(state, args.ports.wss)

  const asEvent = data => JSON.stringify(data)

  wss.on(constants.events.connection, ws => {
    contentChange.on('refresh', () => {
      ws.send(asEvent({
        tag: constants.tags.refresh
      }))
    })
  })

  wss.on(constants.events.message, event => {
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
    site: rawArgs['--site'],
    ports: {
      http: processArgs.port(rawArgs['--http_port'], rawArgs['--wss_port']),
      wss: processArgs.port(rawArgs['--wss_port'], rawArgs['--http_port'])
    }
  }

  await liveReload(args)
}

module.exports = callApplication
