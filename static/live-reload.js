
const socket = new WebSocket('ws://localhost:4001')

socket.addEventListener('open', event => {
  socket.send('connection established.')
})

socket.addEventListener('message', event => {
  location.reload(true)
})
