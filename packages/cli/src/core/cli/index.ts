import process from 'node:process'
import path from 'node:path'
import { lt } from 'semver'
import colors from 'colors/safe'
import { homedir } from 'node-homedir'
import { pathExistsSync } from 'fs-extra'
import rootCheck from 'root-check'
import dotenv from 'dotenv'
import { Command } from 'commander'
import { DEFAULT_CLI_HOME, MIN_NODE_VERSION } from './const'
import pkg from '@/../package.json'
import { getSemverVersion } from '@/utils/npm'
import log from '@/utils/log'
import exec from '@/core/exec'

export default async function core() {
  await prepare()
  registerCommands()
}

async function prepare() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkEnv()
    await checkVersionUpdate()
  }
  catch (error) {
    log.error('core error', (error as Error).message)
  }
}

function checkPkgVersion() {
  log.info('版本', pkg.version)
}

function checkNodeVersion() {
  if (lt(process.version, MIN_NODE_VERSION))
    throw new Error(colors.red(`Node最低版本号为 ${MIN_NODE_VERSION}`))
}

function checkRoot() {
  rootCheck()
}

function checkUserHome() {
  if (!homedir() || !pathExistsSync(homedir()))
    throw new Error('用户主目录不存在')
}

function checkEnv() {
  const dotenvPath = path.resolve(homedir(), '.env')
  if (pathExistsSync(dotenvPath)) {
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
  const pkgVer = pkg.version
  const pkgName = pkg.name
  const version = await getSemverVersion(pkgVer, pkgName)
  if (version)
    log.warn('版本', colors.yellow(`发现新的版本 npm install -g ${pkgName} 更新至：${version}`))
}

function registerCommands() {
  const program = new Command()
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .description('CLI to some JavaScript string utilities')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化', false)
    .action(exec)

  program.on('option:debug', () => {
    process.env.CLI_LOG_LEVEL = log.level = 'verbose'
  })

  program.on('option:targetPath', () => {
    const { targetPath } = program.opts()
    process.env.CLI_TARGETPATH = targetPath
  })

  program.on('command:*', () => {
    log.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  })

  program.parse(process.argv)

  if (program.args && program.args.length < 1)
    program.outputHelp()
}
