
const errors = require('@rgrannell/errors')
const constants = require('../shared/constants')

const WebSocket = require('ws')
const EventEmitter = require('events')

const readEvent = data => {
  try {
    return JSON.parse(data)
  } catch (err) {
    throw errors.invalidWebSocketEvent('non-json websocket event received from site', constants.codes.LR_008)
  }
}

/**
 * Launch a websocket-server
 *
 * @param {Object} state the state object
 * @param {number} port the websocket port
 */
const launchWsServer = async (state, port) => {
  const wss = new WebSocket.Server({ port })

  const emitter = new EventEmitter()

  const { events } = constants

  wss.on(events.connection, ws => {
    ws.on(events.message, event => {
      emitter.emit(events.message, readEvent(event))
    })

    emitter.emit(events.connection, ws)
  })

  return emitter
}

module.exports = launchWsServer
