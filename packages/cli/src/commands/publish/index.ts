import process from 'node:process'
import path from 'node:path'
import fse from 'fs-extra'
import Command from '@/models/command'
import log from '@/utils/log'
import Git from '@/models/git'
import type { GitOptions } from '@/typings/cli'

export class PublishCommand extends Command {
  public gitOptions: GitOptions = {}

  public refreshServer: boolean = false
  public refreshToken: boolean = false
  public refreshOwner: boolean = false

  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    this.refreshServer = this.options.refreshServer
    this.refreshToken = this.options.refreshToken
    this.refreshOwner = this.options.refreshOwner
  }

  public async exec() {
    const startTime = new Date().getTime()
    await this.prepare()
    await new Git({
      ...this.gitOptions,
      refreshServer: this.refreshServer,
      refreshToken: this.refreshToken,
      refreshOwner: this.refreshOwner,
    }).init()
    const endTime = new Date().getTime()
    log.info('发布耗时', `${(endTime - startTime) / 1000}s`)
  }

  public async prepare() {
    const projectPath = process.cwd()
    const pkgPath = path.resolve(projectPath, 'package.json')
    if (!fse.pathExistsSync(pkgPath))
      throw new Error('未找到package.json')

    const pkg = fse.readJSONSync(pkgPath)
    const { name, version, scripts } = pkg
    if (!name || !version || !scripts || !scripts.build) {
      throw new Error(`package.json缺少必要信息 name: ${name} version: ${version} scripts(build): ${scripts.build}`)
    }
    else {
      this.gitOptions = {
        name,
        version,
        dir: projectPath,
      }
      log.info('项目名称', name)
      log.info('项目版本', version)
      log.info('构建命令', scripts.build)
    }
  }
}

export default function publish(args: any[]) {
  return new PublishCommand(args) as any
}