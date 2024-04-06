import GitServer from './GitServer'
import GithubRequest from './GithubRequest'
import type { GitOrg, GitUser, GithubOrg, GithubUser } from '@/typings/cli'

export default class Github extends GitServer {
  public request: GithubRequest | null = null
  constructor() {
    super('github', '')
  }

  public setToken(token: string): void {
    super.setToken(token)
    this.request = new GithubRequest(token)
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
    return this.request?.get<GithubUser>('/user').then<GitUser>((res) => {
      const { login } = res.data
      return {
        login,
      }
    }) ?? null
  }

  public getOrgs(_: string) {
    return this.request?.get<GithubOrg[]>(`/user/orgs`, {
      page: 1,
      per_page: 100,
    }).then<GitOrg[]>((res) => {
      return res.data
    }) ?? null
  }
}
