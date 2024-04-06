import type { GitOrg, GitUser } from '@/typings/cli'

export default abstract class GitServer {
  public type: string = ''
  public token: string = ''
  constructor(type: string, token: string) {
    this.type = type
    this.token = token
  }

  public setToken(token: string): void {
    this.token = token
  }

  public abstract createRepository(): void

  public abstract createOrgRepository(): void

  public abstract getRemote(): void

  public abstract getUser(): Promise<GitUser> | null

  public abstract getOrgs(username: string): Promise<GitOrg[]> | null
}
