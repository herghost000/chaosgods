#! /usr/bin/env node

const process = require('node:process')
const importLocal = require('import-local')

if (importLocal(__filename))
  require('npmlog').info('cli', 'using local version of chaosgods')
else
  require('./lib').default(process.argv.slice(2))
