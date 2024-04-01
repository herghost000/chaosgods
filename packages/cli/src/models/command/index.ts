export default class Command {
  name: string
  options: any
  action: any
  constructor(name: string, options: any, action: any) {
    this.name = name
    this.options = options
    this.action = action
  }
}
