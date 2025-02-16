import process from 'node:process'
import { lt } from 'semver'
import chalk from 'chalk'
import type { Command as CommanderCommand, OptionValues } from 'commander'
import log from '@/utils/log'
import { MIN_NODE_VERSION } from '@/core/cli/const'

export default abstract class Command {
  public commands!: string[]
  public command!: CommanderCommand
  public options!: OptionValues
  private _args: any[]
  constructor(args: any[]) {
    this._args = args

    const runner = new Promise((resolve, _) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain = chain.then(resolve)
      chain.catch((error) => {
        log.error('Command', error.message)
      })
    })
    runner.then(() => {})
  }

  public checkNodeVersion() {
    if (lt(process.version, MIN_NODE_VERSION))
      throw new Error(chalk.red(`Node最低版本号为 ${MIN_NODE_VERSION}`))
  }

  public initArgs() {
    this.command = this._args.pop()
    this.options = this._args.pop()
    this.commands = this._args
  }

  public abstract init(): void

  public abstract exec(): void
}
