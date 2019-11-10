
const errors = require('@rgrannell/errors')
const cheerio = require('cheerio')
const signale = require('signale')
const fsp = require('fs').promises

const constants = require('../shared/constants')

const processHtml = async (fpath, html, state) => {
  const code = await fsp.readFile(constants.paths.liveReload)

  try {
    const $ = cheerio.load(html)
    const $script = $(`<script>${code}</script>`)

    $('head').append($script)

    signale.info(`loaded site ${fpath} v${state.version}`)

    return {
      source: $.html()
    }
  } catch (err) {
    throw errors.failedHtmlProcess(`failed to process site html:\n\n${err.message}`)
  }
}

module.exports = processHtml
