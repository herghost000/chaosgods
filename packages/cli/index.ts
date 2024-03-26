#! /usr/bin/env node

import importLocal from 'import-local'
import log from 'npmlog'
import core from '@/core/cli'

if (importLocal(__filename))
  log.info('cli', 'using local version of chaosgods')
else
  core()
