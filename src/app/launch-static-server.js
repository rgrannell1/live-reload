
const signale = require('signale')
const express = require('express')

/**
 * Serve the index html to the user file.
 *
 * @param {Object} state the state object
 */
const serveIndex = state => (req, res) => {
  const hasSource = state && state.siteData && state.siteData.content && state.siteData.content.source

  if (hasSource) {
    res.send(state.siteData.content.source)
  } else {
    console.log(state)
  }
}

/**
 * launch the static-server
 *
 * @param {Object} state the application's state object
 * @param {number} port the port on which to run the static-server
 */
const launchStaticServer = async (state, publicFolder, port) => {
  const app = express()

  app.get('/', serveIndex(state))

  app.use(express.static(publicFolder))

  app
  .listen(port, () => {
    signale.info(`running http://localhost:${port} 🔄`)
  })
  .on('error', err => {
    if (err.code === 'EADDRINUSE') {
      signale.fatal(`port ${port} is already in use; is live-reload already running?`)
      process.exit(1)
    }
    throw err
  })
}

module.exports = launchStaticServer
