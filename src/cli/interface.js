#!/usr/bin/env node

const {docopt} = require('docopt')
const signale = require('signale')
const errUtils = require('../shared/errors')
const constants = require('../shared/constants')
const package = require('../../package.json')

const doc = `
Usage:
  live-reload [--build=<command>] (--site=<path>) (--public_folder=<path>) [--hide-build-stdout] [--hide-build-stderr] [--http_port=<port>] [--wss_port=<port>]

Author:
  ${package.author}

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

Options:
  --build=<command>         a shell command.
  --http_port=<port>        the static-server port [default: ${constants.ports.http}].
  --public_folder=<path>    the root of the public folder for your static-site. Mandatory.
  --site=<path>             the site to load, relative to the public folder. Mandatory.
  --wss_port=<port>         the websocket-server port [default: ${constants.ports.wss}].
  `

const liveReload = require('../app/live-reload')

liveReload(docopt(doc)).catch(errUtils.report)
