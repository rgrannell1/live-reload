
const errors = require('@rgrannell/errors')
const cheerio = require('cheerio')
const signale = require('signale')
const moment = require('moment')
const fs = require('fs')

const constants = require('../shared/constants')

const processHtml = async (fpath, html, state) => {
  const code = await new Promise((resolve, reject) => {
    fs.readFile(constants.paths.liveReload, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })

  const consts = JSON.stringify({
    version: `v${state.version}`,
    port: 4001
  })

  try {
    const $ = cheerio.load(html)
    const $script = $(`<script>window.constants = ${consts}; ${code}</script>`)

    $('head').append($script)

    const time = moment().format('hh:mm:ss')
    signale.info(`loaded site ${fpath} v${state.version} at ${time}`)

    return {
      source: $.html()
    }
  } catch (err) {
    throw errors.failedHtmlProcess(`failed to process site html:\n\n${err.message}`)
  }
}

module.exports = processHtml
