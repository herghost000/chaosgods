import process from 'node:process'
import path from 'node:path'
import { lt } from 'semver'
import colors from 'colors/safe'
import { homedir } from 'node-homedir'
import pathExists from 'path-exists'
import rootCheck from 'root-check'
import minimist from 'minimist'
import dotenv from 'dotenv'
import log from '../utils/log'
import pkg from '../package.json'
import { getPackageInfo } from '../utils/npm'
import { DEFAULT_CLI_HOME, MIN_NODE_VERSION } from './const'

export default async function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    checkEnv()
    await checkVersionUpdate()
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
  if (lt(process.version, MIN_NODE_VERSION))
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

function checkEnv() {
  const dotenvPath = path.resolve(homedir(), '.env')
  if (pathExists.sync(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    })
  }
  createDefaultConfig()
  log.verbose('CLI_HOME_PATH', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: homedir(),
    cliHome: path.join(homedir(), process.env.CLI_HOME ?? ''),
  }
  if (!process.env.CLI_HOME)
    cliConfig.cliHome = path.join(cliConfig.home, DEFAULT_CLI_HOME)

  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkVersionUpdate() {
//   const pkgVer = pkg.version
  const pkgName = pkg.name
  await getPackageInfo(pkgName, 'https://google.com')
}
