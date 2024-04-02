import process from 'node:process'
import path from 'node:path'
import type { Command } from 'commander'
import { spawn } from '@/utils/process'
import Package from '@/models/package'
import * as commands from '@/commands'
import log from '@/utils/log'

const CACHE_DIR = 'dependencies'
type Handler = undefined | ((args: any[]) => void | Promise<void>)
export default async function exec(...args: any[]) {
  const program = args[args.length - 1] as Command
  const programName = program.name()
  const handler = (commands as Record<string, Handler>)[programName]
  if (handler)
    return handler(args)

  const remotePackages: Record<string, string> = {
    init: '@team-cli/init',
  }
  const packageName = remotePackages[programName] ?? ''
  const version = 'latest'
  let targetPath = process.env.CLI_TARGETPATH ?? ''
  const homePath = process.env.CLI_HOME_PATH ?? ''
  let storePath = ''
  let pkg: Package
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storePath = path.resolve(targetPath, 'node_modules')

    pkg = new Package({
      name: packageName,
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
      name: packageName,
      targetPath,
      storePath,
      version,
    })
  }

  const rootPath = pkg.getRootPath()
  if (rootPath) {
    const code = `require(${rootPath})(${JSON.stringify(args)})`
    const child = spawn('node', ['-e', code], {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    child.on('exit', () => process.exit(0))
    child.on('error', (error) => {
      log.error('exec', error.message)
      process.exit(1)
    })
  }
}
