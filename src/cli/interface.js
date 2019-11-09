
const {docopt} = require('docopt')

const doc = `
Usage:
  script [--build <command>] [--site <path>]

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.
`

const liveReload = require('../app/live-reload')

liveReload(docopt(doc))
