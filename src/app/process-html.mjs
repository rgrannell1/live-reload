
import errors from '@rgrannell/errors'
import cheerio from 'cheerio'
import signale from 'signale'
import moment from 'moment'
import * as fs from 'fs'

import constants from '../shared/constants'

/**
 * Return a modified version of the user-provided site. This will
 * include additional JavaScript content.
 *
 * @param fpath string the file-path of the site
 * @param html string the loaded HTML
 * @param state object the application state
 */
const processHtml = async (fpath, html, state) => {
  const code = await new Promise((resolve, reject) => {
    fs.readFile(constants.paths.liveReload, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })

  const consts = JSON.stringify({
    session: state.session,
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

export default processHtml
