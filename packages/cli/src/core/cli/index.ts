import process from 'node:process'
import path from 'node:path'
import colors from 'colors/safe'
import { homedir } from 'node-homedir'
import { pathExistsSync } from 'fs-extra'
import rootCheck from 'root-check'
import dotenv from 'dotenv'
import { Command } from 'commander'
import gradientString from 'gradient-string'
import ora from 'ora'
import { DEFAULT_CLI_HOME } from './const'
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
    checkBanner()
    checkRoot()
    checkUserHome()
    checkEnv()
    await checkVersionUpdate()
  }
  catch (error) {
    log.error('prepare', (error as Error).message)
  }
}

function checkBanner() {
  // eslint-disable-next-line no-console
  console.log()
  // eslint-disable-next-line no-console
  console.log(gradientString([
    { color: '#42d392', pos: 0 },
    { color: '#42d392', pos: 0.1 },
    { color: '#647eff', pos: 1 },
  ])(`CHAOSGODS - 前端管理工具 ${pkg.version}`))
  // eslint-disable-next-line no-console
  console.log()
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
}

function createDefaultConfig() {
  const home = homedir()

  if (!process.env.CLI_HOME)
    process.env.CLI_HOME = DEFAULT_CLI_HOME

  if (!process.env.CLI_HOME_PATH)
    process.env.CLI_HOME_PATH = path.join(home, DEFAULT_CLI_HOME)
}

async function checkVersionUpdate() {
  const spinner = ora(`检查版本...`).start()
  const pkgVer = pkg.version
  const pkgName = pkg.name
  try {
    const version = await getSemverVersion(pkgVer, pkgName)
    if (version) {
      log.warn('版本', colors.yellow(`发现新的版本 npm install -g ${pkgName} 更新至：${version}`))
      spinner.stopAndPersist({ symbol: '🟡' })
    }
    else { spinner.succeed() }
  }
  catch (error) {
    spinner.stopAndPersist({ symbol: '❌' })
    // eslint-disable-next-line no-console
    console.log()
    throw error
  }
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

  program
    .command('add [templateName]')
    .option('-f, --force', '是否强制添加模版', false)
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
