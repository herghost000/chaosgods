import path from 'node:path'
import { createRequire } from 'node:module'
import { packageDirectorySync } from 'pkg-dir'
import npminstall from 'npminstall'
import fse, { pathExistsSync } from 'fs-extra'
import { gt } from 'semver'
import simpleGit from 'simple-git'
import urlJoin from 'url-join'
import { getDefaultRegistry, getLatestVersion } from '@/utils/npm'
import log from '@/utils/log'
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
    return path.resolve(this.targetPath, this.name)
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
      return pathExistsSync(this.cacheFilePath)
    }
    else { return pathExistsSync(this.isGithub ? this.cacheFilePath : this.targetPath) }
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
    const git = simpleGit(this.cacheFilePath)
    git.clone(this.url, this.cacheFilePath, ['--branch', this.branch], (err) => {
      if (err)
        log.error('Package', '拉取远程仓库失败')
      else
        log.info('Package', '成功拉取远程仓库到本地')
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
    const git = simpleGit(this.cacheFilePath)
    git.checkout(this.branch, (err) => {
      if (err) {
        console.error('切换分支失败:', err)
        return
      }

      git.pull((err, update) => {
        if (err)
          log.error('Package', '更新本地仓库失败:')
        else
          log.info('Package', update ? '本地仓库已更新' : '本地仓库已是最新版本')
      })
    })
  }

  public getRootPath() {
    switch (this.hosts) {
      case PACKAGE_HOSTS_GITHUB:
        return this.cacheFilePath
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
}
