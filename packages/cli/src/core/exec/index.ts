import process from 'node:process'
import path from 'node:path'
import { createRequire } from 'node:module'
import type { Command } from 'commander'
import log from '@/utils/log'
import Package from '@/models/package'
import * as commands from '@/commands'

const CACHE_DIR = 'dependencies'
type Handler = undefined | ((...args: any[]) => void | Promise<void>)
export default async function exec(...args: any[]) {
  const program = args[args.length - 1] as Command
  const programName = program.name()
  const handler = (commands as Record<string, Handler>)[programName]
  if (handler)
    return handler(...args)

  const setting: Record<string, string> = {}
  const name = setting[programName] ?? ''
  log.info('pkgName', name)
  const version = 'latest'
  let targetPath = process.env.CLI_TARGETPATH ?? ''
  const homePath = process.env.CLI_HOME_PATH ?? ''
  let storePath = ''
  let pkg: Package
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storePath = path.resolve(targetPath, 'node_modules')

    pkg = new Package({
      name,
      targetPath,
      storePath,
      version,
    })
    if (await pkg.exists())
      await pkg.update()
    else
      await pkg.install()
  }
  else {
    pkg = new Package({
      name,
      targetPath,
      storePath,
      version,
    })
  }

  const rootPath = pkg.getRootPath()
  log.info('rootPath', rootPath)
  log.info('pkg', pkg)
  if (rootPath) {
    const require = createRequire(__filename)
    const hander = require(rootPath) as Handler
    hander && hander(...args)
  }
}
