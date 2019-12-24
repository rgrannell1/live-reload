
import signale from 'signale'
import express from 'express'
import cors from 'cors'

/**
 * Serve the index html to the user.
 *
 * @param {Object} state the state object
 *
 * @returns {undefined}
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
 * launch a static express-server.
 *
 * @param {Object} state the application's state object
 * @param {number} port the port on which to run the static-server
 *
 * @returns {Express} an express server
 */
const launchStaticServer = async (state, publicDir, port) => {
  const app = express()

  app.use(cors({
    origin: true
  }))

  app.get('/', serveIndex(state))

  app.use(express.static(publicDir))

  const nodeEnv = process.env.NODE_ENV

  return app
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
