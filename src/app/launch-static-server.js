
const signale = require('signale')
const express = require('express')

const serveIndex = state => (req, res) => {
  if (state && state.siteData && state.siteData.content && state.siteData.content.source) {
    res.send(state.siteData.content.source)
  } else {
    console.log(state)
  }
}

const findStaticFolder = () => '.'

const launchStaticServer = async (state, port) => {
  const app = express()

  app.get('/', serveIndex(state))

  app.use(express.static(findStaticFolder()))

  app.listen(port, () => {
    signale.info(`live-reload running http://localhost:${port}`)
  })
}

module.exports = launchStaticServer
