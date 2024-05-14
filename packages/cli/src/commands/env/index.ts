import Command from '@/models/command'
import Config from '@/models/config'
import Spinner from '@/models/spinner'

export class EnvCommand extends Command {
  public action: string = ''
  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    this.action = this.commands[0]
  }

  public exec(): void {
    const config = new Config()
    const spinner = new Spinner(config)
    spinner.show(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }, 'npm test')
    //     // eslint-disable-next-line no-console
    //     console.log(boxen(`\
    // ${chalk.bold('前置依赖(需要手动安装)')}
    // - ${chalk.blue('PNPM https://pnpm.io/')} -> ${hasGlobalCmd('pnpm') ? chalk.green('已安装') : chalk.redBright('未安装')}
    // - ${chalk.blue('Go https://go.dev/doc/install')} -> ${hasGlobalCmd('go') ? chalk.green('已安装') : chalk.redBright('未安装')}
    // ${chalk.bold('依赖组(chaos env proto -i)')}
    // - ${chalk.blue('pnpm add protobufjs-cli -g')} -> ${(hasGlobalCmd('pbjs') && hasGlobalCmd('pbts')) ? chalk.green('已安装') : chalk.redBright('未安装')}
    // ${chalk.bold('依赖组(chaos env task -i)')}
    // - ${chalk.blue('go install github.com/go-task/task/v3/cmd/task@latest')} -> ${hasGlobalCmd('task') ? chalk.green('已安装') : chalk.redBright('未安装')}\
    // `, {
    //       padding: 1,
    //       margin: 1,
    //       borderColor: 'blue',
    //       borderStyle: 'double',
    //       dimBorder: true,
    //       title: chalk.bold('安装依赖(chaos env -i)'),
    //       titleAlignment: 'center',
    //     }))
  }
}

export default function env(args: any[]) {
  return new EnvCommand(args) as any
}
