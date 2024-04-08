import GitServer from './GitServer'
import GiteeRequest from './GiteeRequest'
import type { GitOrg, GitRepository, GitUser, GiteeOrg, GiteeRepository, GiteeUser } from '@/typings/cli'

export default class GiteeServer extends GitServer {
  public request: GiteeRequest | null = null
  constructor() {
    super('gitee', '')
  }

  public setToken(token: string): void {
    super.setToken(token)
    this.request = new GiteeRequest(token)
  }

  public createRepository(name: string) {
    return this.request?.post<GiteeRepository>(`/user/repos`, { name }).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }

  public createOrgRepository(name: string, login: string) {
    return this.request?.post<GiteeRepository>(`/orgs/${login}/repos`, { name }).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }

  public getRemote(login: string, name: string): string {
    return `git@gitee.com:${login}/${name}.git`
  }

  public getUser() {
    return this.request?.get<GiteeUser>('/user').then<GitUser | null>((res) => {
      return this.handleResponse(res)
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

  public getRepository(login: string, name: string) {
    return this.request?.get<GiteeRepository>(`/repos/${login}/${name}`).then<GitRepository | null>((res) => {
      return this.handleResponse(res)
    }) ?? null
  }
}
