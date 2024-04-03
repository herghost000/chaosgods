import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { confirm, input, select } from '@inquirer/prompts'
import fse from 'fs-extra'
import { valid } from 'semver'
import ora from 'ora'
import { glob } from 'glob'
import ejs from 'ejs'
import Command from '@/models/command'
import log from '@/utils/log'
import { getProjectTpls } from '@/utils/github'
import Package from '@/models/package'
import { spawnAsync } from '@/utils/process'

const TYPE_PROJECT = 1
const TYPE_COMPONENT = 2

export class InitCommand extends Command {
  public force: boolean = false
  public tpls: Record<string, string>[] = []
  public tpl: Record<string, string> = {}
  public pkg!: Package
  public projectInfo: {
    name?: string
    version?: string
  } = {}

  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    this.force = this.options.force
  }

  public async exec(): Promise<void> {
    try {
      const info = await this.prepare()
      if (!info)
        return

      await this.downloadTpl()
      await this.installTpl()
    }
    catch (error) {
      log.error('InitCommand exec()', (error as Error).message)
    }
  }

  public async downloadTpl() {
    const homePath = process.env.CLI_HOME_PATH ?? ''
    const targetPath = path.resolve(homePath, 'tpls')
    this.pkg = new Package({
      hosts: this.tpl.hosts,
      name: this.tpl.name,
      targetPath,
      branch: this.tpl.branch,
      version: this.tpl.version,
      account: this.tpl.account,
    })
    if (await this.pkg.exists())
      await this.pkg.update()
    else
      await this.pkg.install()
  }

  public async installTpl() {
    const cloneSpinner = ora(`安装${this.tpl.name}模版...`).start()
    try {
      const targetPath = process.cwd()
      const srcPath = path.resolve(this.pkg.cacheFilePath, 'template')
      fse.ensureDirSync(targetPath)
      fse.ensureDirSync(srcPath)
      fse.copySync(srcPath, targetPath)
      await this.ejsRender()
      cloneSpinner.succeed()
      if (this.tpl.scripts) {
        for (let i = 0; i < this.tpl.scripts.length; i++) {
          const script = this.tpl.scripts[i]
          await this.execCommand(script)
        }
      }
    }
    catch (error) {
      cloneSpinner.isSpinning && cloneSpinner.stopAndPersist({ symbol: '❌' })
      throw error
    }
  }

  public async ejsRender() {
    const dir = process.cwd()
    const files = await glob('**', {
      cwd: dir,
      nodir: true,
      ignore: ['**/node_modules/**'],
    })
    return Promise.all(files.map(async (file) => {
      const filePath = path.resolve(dir, file)
      return new Promise((resolve, reject) => {
        ejs.renderFile(filePath, this.projectInfo, {}, async (error, content) => {
          if (error)
            return reject(error)

          fse.writeFileSync(filePath, content, 'utf-8')
          resolve(content)
        })
      })
    }))
  }

  public async prepare() {
    this.tpls = await getProjectTpls()
    if (!this.tpls || this.tpls.length === 0)
      throw new Error('项目模版不存在')

    const localPath = process.cwd()
    if (!this.isEmptyDir(localPath)) {
      let answer = false
      if (!this.force) {
        answer = await confirm({ message: '当前文件夹不为空，是否继续创建项目?', default: false })
        if (!answer)
          return
      }

      if (answer || this.force) {
        const answer = await confirm({ message: '是否强制清空当前目录?', default: false })
        if (answer)
          fse.emptyDirSync(localPath)
        else
          return
      }
    }
    const info = await this.getProjectInfo()
    this.projectInfo = info
    this.tpl = this.tpls[info.tpl]
    return info
  }

  public async getProjectInfo() {
    const ret = {
      type: TYPE_PROJECT,
      name: '',
      version: '',
      tpl: 0,
    }
    ret.type = await select({
      message: '请选择创建类型',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
          description: 'npm is the most popular package manager',
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
          description: 'yarn is an awesome package manager',
        },
      ],
    })
    if (ret.type === TYPE_PROJECT) {
      ret.name = await input({
        message: '请输入项目名称',
        default: this.projectName || 'project',
        validate(value) {
          return /^[a-zA-Z]+([_-]?[a-zA-Z0-9])*$/.test(value)
        },
      })
      ret.version = await input({
        message: '请输入项目版本号',
        default: '1.0.0',
        validate(value) {
          return !!valid(value)
        },
        transformer(value, { isFinal }) {
          if (isFinal)
            return valid(value) || value

          else
            return value
        },
      })

      ret.tpl = await select({
        message: '请选择项目模版',
        default: 0,
        choices: this.tpls.map((tpl, index) => {
          return {
            name: tpl.name,
            value: index,
            description: tpl.description,
          }
        }),
      })
    }
    else {
      log.info('a', this.tpls)
    }
    return ret
  }

  public isEmptyDir(path: string) {
    const fileList = fs.readdirSync(path)
    return !fileList.length
  }

  public async execCommand(script: string) {
    const cmdsps = script.split(' ')
    const cmd = cmdsps[0]
    const args = cmdsps.slice(1)
    await spawnAsync(cmd, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
  }
}

export default function init(args: any[]) {
  return new InitCommand(args) as any
}
