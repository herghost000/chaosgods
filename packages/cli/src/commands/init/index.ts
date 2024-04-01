import Command from '@/models/command'

export class InitCommand extends Command {
  constructor(args: any[]) {
    super(args)
  }

  public init(): void {
    // console.log('this', this)
  }

  public exec(): void {
    throw new Error('Method not implemented.')
  }
}

export default function init(args: any[]) {
  new InitCommand(args).init()
}
