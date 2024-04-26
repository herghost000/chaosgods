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

const TAG_PROJECT = 'project'
const TAG_COMPONENT = 'component'
const TAG_TEMPLATE = 'template'
const TEMPLATE_NORMAL = 'normal'
const TEMPLATE_CUSTOM = 'custom'

export class InitCommand extends Command {
  public projectName: string = ''
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
    this.projectName = this.commands[0] || 'project'
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
    switch (this.tpl.type) {
      case TEMPLATE_NORMAL:
        return this._installNormalTpl()
      case TEMPLATE_CUSTOM:
        return this._installCustomTpl()
      default:
        break
    }
  }

  private async _installNormalTpl() {
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

  private async _installCustomTpl() {
    // eslint-disable-next-line no-console
    console.log()
    if (this.tpl.scripts) {
      for (let i = 0; i < this.tpl.scripts.length; i++) {
        const script = this.tpl.scripts[i]
        await this.execCommand(script, this.pkg.cacheFilePath)
      }
    }
    const rootPath = this.pkg.getRootPath()
    if (fse.pathExistsSync(rootPath)) {
      const code = `
require("node:process").env.CLI_PKG_INFO = '${JSON.stringify({ cacheFilePath: this.pkg.cacheFilePath })}';
require("node:process").env.CLI_TPL_INFO = '${JSON.stringify(this.tpl)}';
require("node:process").env.CLI_PROJECT_INFO = '${JSON.stringify(this.projectInfo)}';
require("${rootPath}");
`
      await spawnAsync('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
    }
    else {
      throw new Error(`${rootPath} 不存在`)
    }
  }

  public async ejsRender() {
    const dir = process.cwd()
    const files = await glob('**', {
      cwd: dir,
      nodir: true,
      ignore: ['**/node_modules/**', ...(this.tpl.ignores || [])],
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
    this.tpl = this.tpls.filter(tpl => tpl.tags.includes(info.tag))[info.tpl]
    return info
  }

  public async getProjectInfo() {
    const ret = {
      tag: TAG_PROJECT as keyof typeof names,
      name: '',
      version: '',
      tpl: 0,
    }
    const names = {
      [TAG_PROJECT]: '项目',
      [TAG_COMPONENT]: '组件',
      [TAG_TEMPLATE]: '模版',
    }
    const descriptions = {
      [TAG_PROJECT]: '查找快速创建项目相关模版仓库',
      [TAG_COMPONENT]: '查找快速创建组件相关模版仓库',
      [TAG_TEMPLATE]: '查找快速创建自定义模版相关模版仓库',
    }
    ret.tag = await select({
      message: '请选择创建类型',
      default: TAG_PROJECT,
      choices: [
        {
          name: names[TAG_PROJECT],
          value: TAG_PROJECT,
          description: descriptions[TAG_PROJECT],
        },
        {
          name: names[TAG_COMPONENT],
          value: TAG_COMPONENT,
          description: descriptions[TAG_COMPONENT],
        },
        {
          name: names[TAG_TEMPLATE],
          value: TAG_TEMPLATE,
          description: descriptions[TAG_TEMPLATE],
        },

      ],
    })
    ret.name = await input({
      message: '请输入项目名称',
      default: this.projectName,
      validate(value) {
        return /^[a-zA-Z]+(?:[_-]?[a-zA-Z0-9])*$/.test(value)
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
      message: `请选择相关${names[ret.tag]}`,
      default: 0,
      choices: this.tpls.filter((tpl) => {
        return tpl.tags.includes(ret.tag)
      }).map((tpl, index) => {
        return {
          name: tpl.name,
          value: index,
          description: tpl.description,
        }
      }),
    })

    return ret
  }

  public isEmptyDir(path: string) {
    const fileList = fs.readdirSync(path).filter(name => name !== '.git')
    return !fileList.length
  }

  public async execCommand(script: string, cwd?: string) {
    const cmdsps = script.split(' ')
    const cmd = cmdsps[0]
    const args = cmdsps.slice(1)
    await spawnAsync(cmd, args, {
      cwd: cwd || process.cwd(),
      stdio: 'inherit',
    })
  }
}

export default function init(args: any[]) {
  return new InitCommand(args) as any
}
