
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

const onSocketConnection = event => {
  console.info('live-reload: websocket connection open')

  socket.send(asEvent({
    tag: 'connectionOpen',
    version: constants.version,
    session: constants.session
  }))

  document.title = constants.version

  handleServiceWorkers(socket)
}

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

const hasRegistrations = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  return registrations.length > 0
}

const removeRegistrations = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()

  for (const registration of registrations) {
    const succeeded = await registration.unregister()
  }

  const cacheNames = await caches.keys()

  for (const cacheName of cacheNames) {
    await caches.delete(cacheName)
  }
}

const handleServiceWorkers = async socket => {
  await removeRegistrations()

  if (await hasRegistrations()) {
    socket.send(asEvent({
      tag: 'serviceWorkerDetectedAfterUnregister'
    }))
  } else {
    socket.send(asEvent({
      tag: 'serviceWorkerUnregistered'
    }))
  }

}

// -- connect to the server
socket.addEventListener('open', onSocketConnection)
socket.addEventListener('message', handleMessage)
