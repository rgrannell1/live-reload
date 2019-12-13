#!/usr/bin/env node

const { docopt } = require('docopt')
const errUtils = require('../shared/errors')
const constants = require('../shared/constants')
const pkg = require('../../package.json')

const doc = `
Usage:
  live-reload --package

Author:
  ${pkg.author}

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

Options:
  --package should the package be used for configuration?
`

const liveReload = require('../app/live-reload')

liveReload(docopt(doc)).catch(errUtils.report)
