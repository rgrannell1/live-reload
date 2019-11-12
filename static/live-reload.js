
const asEvent = data => {
  return JSON.stringify(data)
}

const fromEvent = data => {
  try {
    return JSON.parse(data.data)
  } catch (err) {
    console.error(`live-reload: failed to read event as json \n${data}`)
  }
}

const socket = new WebSocket(`ws://localhost:${constants.port}`)

// -- connect to the server
socket.addEventListener('open', event => {
  console.error('live-reload: websocket connection open')

  socket.send(asEvent({
    version: constants.version
  }))
})

const eventHandlers = {}

/**
 * Refresh the page when requested.
 */
eventHandlers.refresh = () => {
  location.reload(true)
}

const handleMessage = data => {
  const event = fromEvent(data)

  console.error(`live-reload: event received with tag ${event.tag}`)

  if (eventHandlers.hasOwnProperty(event.tag)) {
    eventHandlers[event.tag](event)
  } else {
    console.error('live-reload: tag cannot be interpreted correctly')
  }
}

socket.addEventListener('message', handleMessage)
