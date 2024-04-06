import GitServer from './GitServer'
import GiteeRequest from './GiteeRequest'
import type { GitOrg, GitUser, GiteeOrg, GiteeUser } from '@/typings/cli'

export default class Gitee extends GitServer {
  public request: GiteeRequest | null = null
  constructor() {
    super('gitee', '')
  }

  public setToken(token: string): void {
    super.setToken(token)
    this.request = new GiteeRequest(token)
  }

  public createRepository(): void {
    throw new Error('Method not implemented.')
  }

  public createOrgRepository(): void {
    throw new Error('Method not implemented.')
  }

  public getRemote(): void {
    throw new Error('Method not implemented.')
  }

  public getUser() {
    return this.request?.get<GiteeUser>('/user').then<GitUser>((res) => {
      const { login } = res.data

      return {
        login,
      }
    }) ?? null
  }

  public getOrgs(username: string) {
    return this.request?.get<GiteeOrg[]>(`/users/${username}/orgs`, {
      page: 1,
      per_page: 100,
    }).then<GitOrg[]>((res) => {
      return res.data
    }) ?? null
  }
}
