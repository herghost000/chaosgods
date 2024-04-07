import GitServer from './GitServer'
import GithubRequest from './GithubRequest'
import type { GitOrg, GitRepository, GitUser, GithubOrg, GithubRepository, GithubUser } from '@/typings/cli'

export default class GithubServer extends GitServer {
  public request: GithubRequest | null = null
  constructor() {
    super('github', '')
  }

  public setToken(token: string): void {
    super.setToken(token)
    this.request = new GithubRequest(token)
  }

  public createRepository(name: string) {
    return this.request?.post<GithubRepository>(`/user/repos`, { name }).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }

  public createOrgRepository(name: string, login: string) {
    return this.request?.post<GithubRepository>(`/orgs/${login}/repos`, { name }, {
      Accept: 'application/vnd.github.v3+json',
    }).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }

  public getRemote(): void {
    throw new Error('Method not implemented.')
  }

  public getUser() {
    return this.request?.get<GithubUser>('/user').then<GitUser | null>((res) => {
      return this.handleResponse(res)
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

  public getRepository(login: string, name: string) {
    return this.request?.get<GithubRepository>(`/repos/${login}/${name}`).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }
}
