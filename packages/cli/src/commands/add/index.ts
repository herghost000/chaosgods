import Command from '@/models/command'

export class AddCommand extends Command {
  constructor(args: any[]) {
    super(args)
  }

  public init(): void {

  }

  public exec(): void {
    // const dir = process.cwd()
    // console.log(dir, path.resolve('dir'))
  }
}

export default function add(args: any[]) {
  return new AddCommand(args) as any
}
