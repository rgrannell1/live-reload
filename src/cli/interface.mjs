#!/usr/bin/env node

import docopt from 'docopt'

import * as fs from 'fs'
import * as path from 'path'

import errUtils from '../shared/errors'
import constants from '../shared/constants'
import liveReload from '../app/live-reload'

const packageLocation = path.resolve('./package.json')

const pkg = JSON.parse(fs.readFileSync(packageLocation).toString())

const doc = `
Usage:
  live-reload --package

Author:
  ${pkg.author}

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

`

liveReload(docopt.docopt(doc)).catch(errUtils.report)
