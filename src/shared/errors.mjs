
import signale from 'signale'

const state = {
  previous: ''
}

/**
 * Report an errors captured by the application
 *
 * @param err {Error} an error captured
 *
 * @returns {undefined}
 */
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

export default {
  report
}
