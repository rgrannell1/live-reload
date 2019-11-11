
const socket = new WebSocket('ws://localhost:4001')

socket.addEventListener('open', event => {
  socket.send('Hello Server!')
})

socket.addEventListener('message', event => {
  alert('received message')
})
