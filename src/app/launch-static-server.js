
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
 * Find the location of the static file server
 *
 * @returns {string} the public folder path
 */
const findStaticFolder = () => {
  return '.'
}

/**
 * launch the static-server
 *
 * @param {Object} state the application's state object
 * @param {number} port the port on which to run the static-server
 */
const launchStaticServer = async (state, port) => {
  const app = express()

  app.get('/', serveIndex(state))

  app.use(express.static(findStaticFolder()))

  app.listen(port, () => {
    signale.info(`running http://localhost:${port} 🔄`)
  })
}

module.exports = launchStaticServer
