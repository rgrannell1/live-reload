
import chokidar from 'chokidar'
import signale from 'signale'
import * as path from 'path'
import { rejects } from 'assert'

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

  return serverPromise.then(server => {
    const nodeEnv = process.env.NODE_ENV

    return new Promise((resolve, reject) => {
      server.default
        .listen(port, () => {
          signale.info(`running API on http://localhost:${port} 🔄: NODE_ENV is ${nodeEnv ? nodeEnv : 'not set'}`)
          resolve(server)
        })
        .on('error', err => {
          if (err.code === 'EADDRINUSE') {
            signale.fatal(`port ${port} is already in use; is live-reload already running?`)
            reject(new Error('port in use'))
          }
          reject(err)
        })
    })
  })
}

export default launchApiServer
