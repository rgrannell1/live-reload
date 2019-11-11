
const asEvent = data => JSON.stringify(data)
const socket = new WebSocket(`ws://localhost:${constants.port}`)

socket.addEventListener('open', event => {
  socket.send(asEvent({
    version: constants.version
  }))
})

socket.addEventListener('message', event => {
  location.reload(true)
})
