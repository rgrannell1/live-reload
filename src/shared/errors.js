
const signale = require('signale')

const state = {
  previous: ''
}

const report = err => {
  if (!err.code) {
    throw err
  }

  const message = `${err.name}/${err.code}: ${err.message}`

  if (state.previous.startsWith('fileNotFound') && message.startsWith('fileNotFound') && err.warn) {
    state.previous = message
    return
  }
  state.previous = message

  if (err.warn) {
    signale.warn(message)
  } else {
    signale.fatal(message)
    process.exit(1)
  }
}

module.exports = {
  report
}
