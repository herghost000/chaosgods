import process from 'node:process'
import fs from 'node:fs'
import { confirm, input, select } from '@inquirer/prompts'
import fse from 'fs-extra'
import { valid } from 'semver'
import Command from '@/models/command'
import log from '@/utils/log'

const TYPE_PROJECT = 1
const TYPE_COMPONENT = 2

export class InitCommand extends Command {
  public force: boolean = false
  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    this.force = this.options.force
  }

  public async exec(): Promise<void> {
    try {
      await this.prepare()
    }
    catch (error) {
      log.error('InitCommand exec()', (error as Error).message)
    }
  }

  public downloadTpl() {
    return 'https://github.com/youzan/vant-cli-template.git'
  }

  public async prepare() {
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
    return this.getProjectInfo()
  }

  public async getProjectInfo() {
    const ret = {
      type: TYPE_PROJECT,
      name: '',
      version: '',
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
        default: 'project',
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
    }
    return ret
  }

  public isEmptyDir(path: string) {
    const fileList = fs.readdirSync(path)
    return !fileList.length
  }
}

export default function init(args: any[]) {
  return new InitCommand(args) as any
}
