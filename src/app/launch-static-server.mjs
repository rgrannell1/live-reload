
import * as signale from 'signale'
import * as express from 'express'

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

  const nodeEnv = process.env.NODE_ENV

  app
    .listen(port, () => {
      signale.info(`running site on http://localhost:${port} 🔄: NODE_ENV is ${nodeEnv ? nodeEnv : 'not set'}`)
    })
    .on('error', err => {
      if (err.code === 'EADDRINUSE') {
        signale.fatal(`port ${port} is already in use; is live-reload already running?`)
        process.exit(1)
      }
      throw err
    })
}

export default launchStaticServer
