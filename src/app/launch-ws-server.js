
const signale = require('signale')

const WebSocket = require('ws')
const EventEmitter = require('events')

const launchWsServer = async (state, port) => {
  const wss = new WebSocket.Server({ port })

  const emitter = new EventEmitter()

  wss.on('connection', ws => {
    ws.on('message', event => {
      emitter.emit('message', event)
    })

    emitter.emit('connection', ws)

    signale.info('websocket server established')
  })

  return emitter
}

module.exports = launchWsServer
