import path from 'node:path'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import { packageDirectorySync } from 'pkg-dir'
import npminstall from 'npminstall'
import fse, { pathExistsSync } from 'fs-extra'
import { gt } from 'semver'
import simpleGit from 'simple-git'
import urlJoin from 'url-join'
import ora from 'ora'
import { getDefaultRegistry, getLatestVersion } from '@/utils/npm'
import { GITHUB_BASE_URL } from '@/core/cli/const'

const require = createRequire(__filename)

interface PackageOptions {
  hosts: string
  name: string
  targetPath: string
  storePath: string
  version: string
  account: string
  branch: string
}

export const PACKAGE_HOSTS_NPM = 'npm'
export const PACKAGE_HOSTS_GITHUB = 'github'

export default class Package {
  public hosts: string = PACKAGE_HOSTS_NPM
  public name: string = ''
  public targetPath: string = ''
  public storePath: string = ''
  public version: string = ''
  public account: string = 'herghost000'
  public branch: string = 'main'

  get isNpm() {
    return this.hosts === PACKAGE_HOSTS_NPM
  }

  get isGithub() {
    return this.hosts === PACKAGE_HOSTS_GITHUB
  }

  get url() {
    switch (this.hosts) {
      case PACKAGE_HOSTS_NPM:
        return this._urlOfNpm
      case PACKAGE_HOSTS_GITHUB:
        return this._urlOfGithub
      default:
        return ''
    }
  }

  private get _urlOfNpm() {
    return ''
  }

  private get _urlOfGithub() {
    return urlJoin(GITHUB_BASE_URL, this.account, `${this.name}.git`)
  }

  get cacheFilePath() {
    switch (this.hosts) {
      case PACKAGE_HOSTS_NPM:
        return this._cacheFilePathOfNpm
      case PACKAGE_HOSTS_GITHUB:
        return this._cacheFilePathOfGithub
      default:
        return ''
    }
  }

  private get _cacheFilePathOfNpm() {
    return path.resolve(this.storePath, this.name)
  }

  private get _cacheFilePathOfGithub() {
    return path.resolve(this.targetPath, this.account, this.name)
  }

  constructor(options: Partial<PackageOptions>) {
    Object.assign(this, options)
  }

  public async prepare() {
    if (this.cacheFilePath && !pathExistsSync(this.cacheFilePath))
      fse.mkdirpSync(this.cacheFilePath)

    if (this.isNpm && this.version === 'latest')
      this.version = await getLatestVersion(this.name)
  }

  public async exists() {
    if (this.storePath) {
      await this.prepare()
      return pathExistsSync(this.cacheFilePath) && !this.isEmptyDir(this.cacheFilePath)
    }
    else { return pathExistsSync(this.isGithub ? this.cacheFilePath : this.targetPath) && !this.isEmptyDir(this.cacheFilePath) }
  }

  public async install() {
    await this.prepare()
    switch (this.hosts) {
      case PACKAGE_HOSTS_NPM:
        return this._installOfNpm()
      case PACKAGE_HOSTS_GITHUB:
        return this._installOfGithub()
      default:
        break
    }
  }

  private async _installOfNpm() {
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.name,
          version: this.version,
        },
      ],
    })
  }

  private async _installOfGithub() {
    const cloneSpinner = ora(`克隆远程仓库 ${this.url}...`).start()
    const git = simpleGit(this.cacheFilePath)
    await git.clone(this.url, this.cacheFilePath, ['--branch', this.branch], (err) => {
      if (err)
        cloneSpinner.stopAndPersist({ symbol: '❌' })
      else
        cloneSpinner.succeed()
    })
  }

  public async update() {
    await this.prepare()
    switch (this.hosts) {
      case PACKAGE_HOSTS_NPM:
        return this._updateOfNpm()
      case PACKAGE_HOSTS_GITHUB:
        return this._updateOfGithub()
      default:
        break
    }
  }

  private async _updateOfNpm() {
    if (!pathExistsSync(this.cacheFilePath) || gt(this.version, require(path.resolve(this.cacheFilePath, 'package.json')).version)) {
      return npminstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.name,
            version: this.version,
          },
        ],
      })
    }
  }

  private async _updateOfGithub() {
    const checkoutSpinner = ora(`检出分支${this.branch}...`).start()
    const git = simpleGit(this.cacheFilePath)
    await git.checkout(this.branch, async (err) => {
      if (err) {
        checkoutSpinner.stopAndPersist({ symbol: '❌' })
        return
      }
      checkoutSpinner.succeed()
    })
    const pullSpinner = ora(`更新分支${this.branch}...`).start()
    await git.pull((err, _) => {
      if (err)
        pullSpinner.stopAndPersist({ symbol: '❌' })
      else
        pullSpinner.succeed()
    })
  }

  public getRootPath() {
    switch (this.hosts) {
      case PACKAGE_HOSTS_GITHUB:
        return this._getRootPathOfGithub()
      case PACKAGE_HOSTS_NPM:
        return this._getRootPathOfNpm()
      default:
        return ''
    }
  }

  private _getRootPathOfNpm() {
    const dir = packageDirectorySync({ cwd: this.storePath ? this.cacheFilePath : this.targetPath })
    if (dir) {
      const pkg = require(path.resolve(dir, 'package.json'))
      return path.resolve(dir, pkg.main)
    }
    return ''
  }

  private _getRootPathOfGithub() {
    const dir = packageDirectorySync({ cwd: this.cacheFilePath })
    if (dir) {
      const pkg = require(path.resolve(dir, 'package.json'))
      return path.resolve(dir, pkg.main)
    }
    return ''
  }

  public isEmptyDir(path: string) {
    const fileList = fs.readdirSync(path)
    return !fileList.length
  }
}
