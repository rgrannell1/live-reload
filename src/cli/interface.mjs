#!/usr/bin/env node

import docopt from 'docopt'

import * as fs from 'fs'

import errUtils from '../shared/errors'
import constants from '../shared/constants'

const pkg = JSON.parse(fs.readFileSync('../../package.json').toString())

const doc = `
Usage:
  live-reload --package

Author:
  ${pkg.author}

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

`

const liveReload = require('../app/live-reload')

liveReload(docopt(doc)).catch(errUtils.report)
