
const signale = require('signale')

const report = err => {
  if (!err.code) {
    throw err
  }
  if (err.warn) {
    const message = `${err.name}/${err.code}: ${err.message}`
    signale.warn(message)
  } else {
   const message = `${err.name}/${err.code}: ${err.message}`
    signale.fatal(message)
    process.exit(1)
  }
}

module.exports = {
  report
}
