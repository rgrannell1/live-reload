
const {docopt} = require('docopt')
const signale = require('signale')
const errUtils = require('../shared/errors')

const doc = `
Usage:
  script [--build=<command>] [--site=<path>] [--hide-build-stdout] [--hide-build-stderr] [--port=<port>]

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

Options:
  --build=<command>    a shell command.
  --site=<path>        .
  --port=<port>        .
  `

const liveReload = require('../app/live-reload')

liveReload(docopt(doc)).catch(errUtils.report)
