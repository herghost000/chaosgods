import process from 'node:process'
import path from 'node:path'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { homedir } from 'node-homedir'
import fse from 'fs-extra'
import { confirm, input, password, select } from '@inquirer/prompts'
import ora from 'ora'
import terminalLink from 'terminal-link'
import { gt, gte, inc, valid } from 'semver'
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
const GIT_IGNORE_FILE = '.gitignore'
const GIT_PLATFORM_GITHUB = 'github'
const GIT_PLATFORM_GITEE = 'gitee'
const GIT_REPOSITORY_USER = 'user'
const GIT_REPOSITORY_ORG = 'org'
const VERSION_RELEASE = 'release'
const VERSION_DEVELOP = 'develop'

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
  public type: string = ''
  /** 远程仓库登录名 */
  public login: string = ''
  /** 远程仓库信息 */
  public repository: GitRepository | null = null
  public remote: string = ''
  public branch: string = ''

  constructor(options: GitOptions) {
    Object.assign(this, options)
    this.git = simpleGit(this.dir)
  }

  public async prepare() {
    this.checkHomePath()
    await this.checkGitServer()
    await this.checkGitToken()
    await this.getUserAndOrgs()
    await this.checkGitOwner()
    await this.checkRepository()
    this.checkGitignore()
  }

  public async init() {
    if (this.isInitGit())
      return

    await this.initAndAddRemote()
    await this.initCommit()
  }

  public async commit() {
    await this.getCorrectVersion()
    await this.checkStash()
    await this.checkConflicted()
    await this.checkoutBranch(this.branch)
    await this.pullRemoteMainAndDevelop()
    await this.pushRemote(this.branch)
  }

  /**
   * @zh 检查stash区是否存在未恢复的代码，如果存在则恢复
   * @en Check if there are any unstaged changes in the stash area, and restore them if found.
   *
   * @memberof Git
   */
  public async checkStash() {
    const stashList = await this.git.stashList()
    if (stashList.all.length) {
      const stashSpinner = ora('恢复stash区...').start()
      await this.git.stash(['pop'])
      stashSpinner.succeed()
    }
  }

  /**
   * @zh 根据远程和本地版本生成正确的分支版本。
   * @en Generate the correct version for the branch based on remote and local versions.
   *
   * @memberof Git
   */
  public async getCorrectVersion() {
    const remoteVersions = await this.getRemoteVersions(VERSION_RELEASE)
    let releaseVersion: string = ''
    if (remoteVersions && remoteVersions.length)
      releaseVersion = remoteVersions[0]

    ora().succeed(`远程最新版本... ${releaseVersion ? (`${VERSION_RELEASE}/${releaseVersion}`) : 'N/A'}`)

    const devVersion = this.version
    if (!releaseVersion) {
      this.branch = `${VERSION_DEVELOP}/${devVersion}`
    }
    else if (gte(this.version, releaseVersion)) {
      log.info('本地版本大于线上最新版本', `${devVersion} >= ${releaseVersion}`)
      this.branch = `${VERSION_DEVELOP}/${devVersion}`
    }
    else {
      log.info('本地版本小于线上最新版本', `${devVersion} < ${releaseVersion}`)
      const standardize = await select({
        message: '请选择版本升级规范',
        default: 'patch',
        choices: [
          {
            name: `补丁版本 (${releaseVersion} -> ${inc(releaseVersion, 'patch')})`,
            value: 'patch',
          },
          {
            name: `次要版本 (${releaseVersion} -> ${inc(releaseVersion, 'minor')})`,
            value: 'patch',
          },
          {
            name: `主要版本 (${releaseVersion} -> ${inc(releaseVersion, 'major')})`,
            value: 'major',
          },
        ],
      })
      const newVersion = inc(releaseVersion, standardize as any) ?? ''
      this.branch = `${VERSION_DEVELOP}/${newVersion}`
      this.version = newVersion
    }

    this.syncVersion()
  }

  public async syncVersion() {
    const pkg = fse.readJsonSync(path.resolve(this.dir, 'package.json'))
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version
      fse.writeJsonSync(path.resolve(this.dir, 'package.json'), pkg, { spaces: 2 })
    }
  }

  public async getRemoteVersions(type: string) {
    const checkSpinner = ora(`检查远程版本... ${type}`).start()
    if (type === VERSION_RELEASE) {
      const tags = await this.git.tags()
      checkSpinner.succeed(`检查远程版本... ${type}: ${tags.all.length}`)
      const reg = /release\/(\d+\.\d+\.\d+-?\S*?\.?\d*)/im
      return tags.all.map((tag) => {
        const match = reg.exec(tag)
        if (match && valid(match[1]))
          return match[1]
        return null
      }).filter(Boolean).sort((a, b) => gt(b as string, a as string) ? 1 : -1) as string[]
    }
    else {
      const reg = /develop\/(\d+\.\d+\.\d+-?\S*?\.?\d*)/im
      const branchs = await this.git.branch(['-r'])
      const versions = branchs.all.map((branch) => {
        const match = reg.exec(branch)
        if (match && valid(match[1]))
          return match[1]
        return null
      }).filter(Boolean).sort((a, b) => gt(b as string, a as string) ? 1 : -1) as string[]
      checkSpinner.succeed(`检查远程版本... ${type}: ${versions.length}`)
      return versions
    }
  }

  public isInitGit() {
    const gitPath = path.resolve(this.dir, GIT_ROOT_DIR)
    this.remote = this.gitServer?.getRemote(this.login, this.name) ?? ''
    if (fse.pathExistsSync(gitPath))
      return true
    return false
  }

  public async initAndAddRemote() {
    this.remote = this.gitServer?.getRemote(this.login, this.name) ?? ''
    const initSpinner = ora(`初始化本地仓库...`).start()
    await this.git.init()
    initSpinner.succeed()
    const remotes = await this.git.getRemotes()
    if (!remotes.find(remote => remote.name === 'origin')) {
      const addRemoteSpinner = ora(`添加远程仓库...`).start()
      await this.git.addRemote('origin', this.remote)
      addRemoteSpinner.succeed()
    }
  }

  public async initCommit() {
    await this.checkConflicted()
    await this.checkUnCommitted()
    if (await this.checkRemoteMain()) {
      await this.pullRemote('main', {
        '--allow-unrelated-histories': true,
      })
    }

    else {
      await this.checkoutBranch('main')
      await this.pushRemote('main')
    }
  }

  public async pushRemote(name: string) {
    const pushSpinner = ora(`推送代码到远程...`).start()
    await this.git.push(['-u', 'origin', name])
    pushSpinner.succeed(`推送代码到远程... ${name}`)
  }

  public async pullRemote(name: string, options: any = {}) {
    const pullSpinner = ora(`拉取远程代码... ${name}`).start()
    await this.git.pull('origin', name, options)
    pullSpinner.succeed(`拉取远程代码... ${name}`)
  }

  /**
   * 检查冲突文件，如果有冲突文件则抛出错误。
   *
   * @return {Promise<void>}
   */
  public async checkConflicted(): Promise<void> {
    const checkSpinner = ora(`检查冲突文件...`).start()
    const status = await this.git.status()
    if (status.conflicted.length) {
      checkSpinner.stopAndPersist({ symbol: '❌' })
      throw new Error(`冲突文件列表:\n${status.conflicted.join('\n')}`)
    }
    checkSpinner.succeed(`检查冲突文件... N/A`)
  }

  public async checkoutBranch(branch: string) {
    const checkSpinner = ora(`切换分支... ${branch}`).start()
    const localBranchs = await this.git.branchLocal()
    if (localBranchs.all.includes(branch))
      await this.git.checkout(branch)
    else
      await this.git.checkoutLocalBranch(branch)
    checkSpinner.succeed()
  }

  public async pullRemoteMainAndDevelop() {
    const pullSpinner = ora(`合并分支 [main] -> [${this.branch}]...`).start()
    await this.pullRemote('main')
    pullSpinner.succeed()
    await this.checkConflicted()
    const devVersions = await this.getRemoteVersions(VERSION_DEVELOP)
    if (devVersions.includes(this.version)) {
      const pullSpinner = ora(`合并分支 [${this.branch}] -> [${this.branch}]...`).start()
      await this.pullRemote(this.branch)
      pullSpinner.succeed()
      await this.checkConflicted()
    }
  }

  public async checkUnCommitted() {
    const checkSpinner = ora(`检查未提交文件...`).start()
    const status = await this.git.status()
    if (status.not_added.length || status.created.length || status.deleted.length || status.modified.length || status.renamed.length) {
      await this.git.add(status.not_added)
      await this.git.add(status.created)
      await this.git.add(status.deleted)
      await this.git.add(status.modified)
      await this.git.add(status.renamed.map(renamed => renamed.to))
    }
    checkSpinner.succeed()
    if (!status.staged.length)
      return

    const isCommit = await confirm({
      message: '是否提交本地修改文件？',
      default: false,
    })

    if (!isCommit)
      return

    const message = await input({
      message: '请输入提交说明',
      default: '',
    })

    const commitSpinner = ora(`提交文件...`).start()
    await this.git.commit(message)
    commitSpinner.succeed()
  }

  public async checkRemoteMain() {
    const checkSpinner = ora(`检查远程仓库...`).start()
    const branch = await this.git.branch(['-r'])
    checkSpinner.succeed()
    return branch.all.includes('origin/main') || branch.all.includes('origin/master')
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
    ora().succeed(`获取Git服务... ${gitServer}`)
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
    const userSpinner = ora(`获取用户信息...`).start()
    this.user = await this.gitServer?.getUser() ?? null
    if (!this.user?.login) {
      userSpinner.stopAndPersist({ symbol: '❌' })
      throw new Error('未获取到用户信息')
    }

    userSpinner.succeed(`获取用户信息... ${this.user.login}`)

    const orgsSpinner = ora(`获取组织信息...`).start()
    this.orgs = await this.gitServer?.getOrgs(this.user.login) ?? null
    if (!this.orgs) {
      orgsSpinner.stopAndPersist({ symbol: '❌' })
      throw new Error('未获取到组织信息')
    }
    orgsSpinner.succeed(`获取组织信息... ${this.orgs.map(org => org.login).join(',') || 'N/A'}`)
  }

  public async checkGitOwner() {
    const gitOwnerPath = this.createPath(GIT_OWNER_FILE)
    const gitLoginPath = this.createPath(GIT_LOGIN_FILE)
    let gitType = readFile(gitOwnerPath) ?? ''
    let gitLogin = readFile(gitLoginPath) ?? ''
    if (!gitType || !gitLogin || this.refreshOwner) {
      gitType = await select({
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
      if (gitType === GIT_REPOSITORY_USER) {
        gitLogin = this.user?.login ?? ''
      }
      else if (gitType === GIT_REPOSITORY_ORG) {
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
      writeFile(gitOwnerPath, gitType)
      writeFile(gitLoginPath, gitLogin)
    }
    ora().succeed(`获取仓库类型... ${gitType}`)
    ora().succeed(`获取仓库所属... ${gitLogin}`)
    this.type = gitType
    this.login = gitLogin
  }

  public async checkRepository() {
    let repository = await this.gitServer?.getRepository(this.login, this.name)
    if (!repository) {
      const createSpinner = ora(`创建远程仓库...`).start()
      if (this.type === GIT_REPOSITORY_USER)
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
    ora().succeed(`获取仓库地址... ${link}`)
  }

  public checkGitignore() {
    const gitignorePath = path.resolve(this.dir, GIT_IGNORE_FILE)
    if (!fse.existsSync(gitignorePath)) {
      writeFile(gitignorePath, `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local

/cypress/videos/
/cypress/screenshots/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

*.tsbuildinfo`)
      log.success('.gitignore', '创建完成')
    }
  }

  public createPath(file: string) {
    const rootDir = path.resolve(this.homePath, GIT_ROOT_DIR)
    const filePath = path.resolve(rootDir, file)
    fse.ensureDirSync(rootDir)
    return filePath
  }
}
