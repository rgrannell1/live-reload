
import * as chalk from 'chalk'
import * as cp from 'child_process'
import * as stripAnsi from 'strip-ansi'
import * as errors from '@rgrannell/errors'
import constants from '../shared/constants.mjs'
const { codes } = constants

const buildExit = {}

/**
 * Display a build-exception.
 *
 */
buildExit.error = (code, signal) => {
  throw errors.buildError(`build process exited with ${code} status.`, codes.LR_004)
}
/**
 *
 * Display that a build terminated
 *
 */
buildExit.success = () => {
  throw errors.buildExit('build succeed but exited; live-reload builds should watch for file-changes persistantly', codes.LR_004)
}

/**
 * Launch a build
 *
 * @param {Object} pids
 * @param {string} buildArg
 */
const launchBuild = (pids, hide, buildArg) => {
  const child = cp.spawn(buildArg, {
    shell: true
  })

  if (!hide.stdout) {
    child.stdout.on('data', data => {
      const content = stripAnsi(data.toString())
      console.log(chalk.blue(content))
    })
  }

  if (!hide.stderr) {
    child.stderr.on('data', data => {
      const content = stripAnsi(data.toString())
      console.error(chalk.red(content))
    })
  }

  child.on('exit', (code, signal) => {
    buildExit.error(code, signal)
  })

  pids.build = child
}

export default launchBuild
