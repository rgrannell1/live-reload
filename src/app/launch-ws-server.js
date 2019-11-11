
const signale = require('signale')
const errors = require('@rgrannell/errors')

const WebSocket = require('ws')
const EventEmitter = require('events')

const readEvent = data => {
  try {
    return JSON.parse(data)
  } catch (err) {
    throw errors.invalidWebSocketEvent('non-json websocket event received from site', constants.codes.LR_008)
  }
}

const launchWsServer = async (state, port) => {
  const wss = new WebSocket.Server({ port })

  const emitter = new EventEmitter()

  wss.on('connection', ws => {
    ws.on('message', event => {
      emitter.emit('message', readEvent(event))
    })

    emitter.emit('connection', ws)
  })

  return emitter
}

module.exports = launchWsServer
