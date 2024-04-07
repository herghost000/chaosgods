import process from 'node:process'
import path from 'node:path'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { homedir } from 'node-homedir'
import fse from 'fs-extra'
import { password, select } from '@inquirer/prompts'
import ora from 'ora'
import terminalLink from 'terminal-link'
import GithubServer from './Github'
import GiteeServer from './Gitee'
import type GitServer from './GitServer'
import type { GitOptions, GitOrg, GitRepository, GitUser } from '@/typings/cli'
import { DEFAULT_CLI_HOME } from '@/core/cli/const'
import { readFile, writeFile } from '@/utils/fs'
import log from '@/utils/log'

const GIT_ROOT_DIR = '.git'
const GIT_SERVER_FILE = '.git_server'
const GIT_TOKEN_FILE = '.git_token'
const GIT_OWNER_FILE = '.git_owner'
const GIT_LOGIN_FILE = '.git_login'
const GIT_PLATFORM_GITHUB = 'github'
const GIT_PLATFORM_GITEE = 'gitee'
const GIT_REPOSITORY_USER = 'user'
const GIT_REPOSITORY_ORG = 'org'

export default class Git {
  /** 项目名称 */
  public name: string = ''
  /** 项目版本 */
  public version: string = ''
  /** 项目目录 */
  public dir: string = ''
  /** 是否重新设置git平台 */
  public refreshServer: boolean = false
  /** 是否重新设置平台token */
  public refreshToken: boolean = false
  /** 是否重新设置仓库类型 */
  public refreshOwner: boolean = false
  public git: SimpleGit
  public gitServer: GitServer | null = null
  /** 用户缓存目录 */
  public homePath: string = ''
  /** 仓库API Token */
  public token: string = ''
  /** 用户信息 */
  public user: GitUser | null = null
  /** 用户所属组织列表 */
  public orgs: GitOrg[] | null = null
  /** 远程仓库类型 */
  public owner: string = ''
  /** 远程仓库登录名 */
  public login: string = ''
  /** 远程仓库信息 */
  public repository: GitRepository | null = null

  constructor(options: GitOptions) {
    Object.assign(this, options)
    this.git = simpleGit(this.dir)
  }

  public async init() {
    await this.prepare()
  }

  public async prepare() {
    this.checkHomePath()
    await this.checkGitServer()
    await this.checkGitToken()
    await this.getUserAndOrgs()
    await this.checkGitOwner()
    await this.checkRepository()
  }

  public checkHomePath() {
    if (!this.homePath)
      this.homePath = process.env.CLI_HOME_PATH ?? path.resolve(homedir(), DEFAULT_CLI_HOME)
  }

  public async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE)
    let gitServer = readFile(gitServerPath) ?? ''

    if (!gitServer || this.refreshServer) {
      gitServer = await select({
        message: '请选择托管的git平台',
        default: GIT_PLATFORM_GITHUB,
        choices: [
          {
            name: 'GitHub',
            value: GIT_PLATFORM_GITHUB,
          },
          {
            name: 'Gitee',
            value: GIT_PLATFORM_GITEE,
          },
        ],
      })
      writeFile(gitServerPath, gitServer)
    }
    log.info('Git服务', gitServer)
    this.gitServer = this.createGitServer(gitServer)
    if (!this.gitServer)
      throw new Error('不支持的git服务')
  }

  public createGitServer(gitServer: string): GitServer | null {
    switch (gitServer.trim()) {
      case GIT_PLATFORM_GITHUB:
        return new GithubServer()
      case GIT_PLATFORM_GITEE:
        return new GiteeServer()
      default:
        return null
    }
  }

  public async checkGitToken() {
    const gitTokenPath = this.createPath(GIT_TOKEN_FILE)
    let gitToken = readFile(gitTokenPath) ?? ''
    if (!gitToken || this.refreshToken) {
      gitToken = await password({
        message: '请输入平台token',
        mask: '*',
      })
      writeFile(gitTokenPath, gitToken)
    }
    this.token = gitToken
    this.gitServer?.setToken(gitToken)
  }

  public async getUserAndOrgs() {
    this.user = await this.gitServer?.getUser() ?? null
    if (!this.user?.login)
      throw new Error('未获取到用户信息')

    this.orgs = await this.gitServer?.getOrgs(this.user.login) ?? null
    if (!this.orgs)
      throw new Error('未获取到组织信息')
  }

  public async checkGitOwner() {
    const gitOwnerPath = this.createPath(GIT_OWNER_FILE)
    const gitLoginPath = this.createPath(GIT_LOGIN_FILE)
    let gitOwner = readFile(gitOwnerPath) ?? ''
    let gitLogin = readFile(gitLoginPath) ?? ''
    if (!gitOwner || !gitLogin || this.refreshOwner) {
      gitOwner = await select({
        message: '请选择远程仓库类型',
        default: GIT_REPOSITORY_USER,
        choices: (this.orgs && this.orgs.length > 0)
          ? [
              {
                name: '个人',
                value: GIT_REPOSITORY_USER,
              },
              {
                name: '组织',
                value: GIT_REPOSITORY_ORG,
              },
            ]
          : [
              {
                name: '个人',
                value: GIT_REPOSITORY_USER,
              },
            ],
      })
      if (gitOwner === GIT_REPOSITORY_USER) {
        gitLogin = this.user?.login ?? ''
      }
      else if (gitOwner === GIT_REPOSITORY_ORG) {
        gitLogin = await select({
          message: '请选择组织',
          default: '',
          choices: this.orgs?.map((org) => {
            return {
              name: org.login,
              value: org.login,
            }
          }) ?? [],
        })
      }
      writeFile(gitOwnerPath, gitOwner)
      writeFile(gitLoginPath, gitLogin)
    }
    log.success('类型', gitOwner)
    log.success('用户', gitLogin)
    this.owner = gitOwner
    this.login = gitLogin
  }

  public async checkRepository() {
    let repository = await this.gitServer?.getRepository(this.login, this.name)
    if (!repository) {
      const createSpinner = ora(`创建远程仓库...`).start()
      if (this.owner === GIT_REPOSITORY_USER)
        repository = await this.gitServer?.createRepository(this.name)
      else
        repository = await this.gitServer?.createOrgRepository(this.name, this.login)

      createSpinner.succeed()
    }

    const link = terminalLink(repository?.html_url ?? '', repository?.html_url ?? '', {
      fallback(_, url) {
        return url
      },
    })
    log.success('仓库地址', link)
  }

  public createPath(file: string) {
    const rootDir = path.resolve(this.homePath, GIT_ROOT_DIR)
    const filePath = path.resolve(rootDir, file)
    fse.ensureDirSync(rootDir)
    return filePath
  }
}
