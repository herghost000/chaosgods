import type Git from '@/models/git'
import type { CloudBuildOptions } from '@/typings/cli'

export default class CloudBuild {
  public static readonly TIMEOUT = 5 * 60
  public git: Git
  public buildCmd: string = ''

  constructor(git: Git, options: CloudBuildOptions) {
    this.git = git
    Object.assign(this, options)
  }

  public async init() {
    // todo
  }
}
