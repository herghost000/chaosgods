import chalk from 'chalk'
import boxen from 'boxen'
import Command from '@/models/command'
import { hasGlobalCmd } from '@/utils/fs'

export class EnvCommand extends Command {
  public action: string = ''
  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    this.action = this.commands[0]
  }

  public exec(): void {
    // eslint-disable-next-line no-console
    console.log(boxen(`\
    ${chalk.bold('依赖组(chaos env proto -i)')}
    - ${chalk.blue('pnpm add protobufjs-cli -g')} -> ${(hasGlobalCmd('pbjs') && hasGlobalCmd('pbts')) ? chalk.green('已安装') : chalk.redBright('未安装')}
    ${chalk.bold('依赖组(chaos env xxx -i)')}`, {
      padding: 1,
      margin: 1,
      align: 'left',
      borderColor: 'blue',
      borderStyle: 'round',
    }))
  }
}

export default function env(args: any[]) {
  return new EnvCommand(args) as any
}
