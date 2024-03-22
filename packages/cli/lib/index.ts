import process from 'node:process'
import semver from 'semver'
import colors from 'colors/safe'
import { homedir } from 'node-homedir'
import pathExists from 'path-exists'
import rootCheck from 'root-check'
import minimist from 'minimist'
import log from '../utils/log'
import pkg from '../package.json'
import { MIN_NODE_VERSION } from './const'

export default function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    log.verbose('debbb', 'test debug')
  }
  catch (error) {
    log.error('core error', (error as Error).message)
  }
}

let args: minimist.ParsedArgs

function checkPkgVersion() {
  log.info('脚手架版本', pkg.version)
}

function checkNodeVersion() {
  if (semver.lt(process.version, MIN_NODE_VERSION))
    throw new Error(colors.red(`Node最低版本号为 ${MIN_NODE_VERSION}`))
}

function checkRoot() {
  rootCheck()
}

function checkUserHome() {
  if (!homedir() || !pathExists.sync(homedir()))
    throw new Error('用户主目录不存在')
}

function checkInputArgs() {
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug)
    log.level = 'verbose'
  else
    log.level = 'info'
}
