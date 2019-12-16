
import * as path from 'path'

/**
 * Launch an API server.
 *
 * @param {Object} state
 * @param {string} path
 * @param {number} port
 *
 * @return {Server}
 */
const launchApiServer = (state, fpath, port) => {
  const fullPath = path.resolve(fpath)
  let serverPromise

  if (fullPath.endsWith('.mjs')) {
    serverPromise = import(fullPath)
  } else {
    serverPromise = Promise.resolve(require(fullPath))
  }

  serverPromise.then(server => {
    serverPromise
      .listen(port, () => {
        signale.info(`running API on http://localhost:${port} 🔄: NODE_ENV is ${nodeEnv ? nodeEnv : 'not set'}`)
      })
      .on('error', err => {
        if (err.code === 'EADDRINUSE') {
          signale.fatal(`port ${port} is already in use; is live-reload already running?`)
          process.exit(1)
        }
        throw err
      })
  })
}

export default launchApiServer
