import type { AxiosResponse } from 'axios'
import type { GitOrg, GitRepository, GitUser } from '@/typings/cli'

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

  public abstract createRepository(name: string): Promise<GitRepository | null> | null

  public abstract createOrgRepository(name: string, login: string): Promise<GitRepository | null> | null

  public abstract getRemote(): void

  public abstract getUser(): Promise<GitUser | null> | null

  public abstract getOrgs(username: string): Promise<GitOrg[]> | null

  public abstract getRepository(login: string, name: string): Promise<GitRepository | null> | null

  public isHttpResponse<T = any>(response: AxiosResponse<T>) {
    return response && response.status
  }

  public handleResponse<T = any>(response: AxiosResponse<T>) {
    if (this.isHttpResponse(response) && (response.status < 200 || response.status >= 300))
      return null

    return response.data
  }
}
