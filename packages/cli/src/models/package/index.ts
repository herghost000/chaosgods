import path from 'node:path'
import { createRequire } from 'node:module'
import { packageDirectorySync } from 'pkg-dir'
import npminstall from 'npminstall'
import fse, { pathExistsSync } from 'fs-extra'
import { gt } from 'semver'
import { getDefaultRegistry, getLatestVersion } from '@/utils/npm'

const require = createRequire(__filename)

interface PackageOptions {
  name: string
  targetPath: string
  storePath: string
  version: string
}

export default class Package {
  public name!: string
  public targetPath!: string
  public storePath!: string
  public version!: string

  get cacheFilePath() {
    return path.resolve(this.storePath, this.name)
  }

  constructor(options: PackageOptions) {
    Object.assign(this, options)
  }

  public async prepare() {
    if (this.storePath && !pathExistsSync(this.storePath))
      fse.mkdirpSync(this.storePath)

    if (this.version === 'latest')
      this.version = await getLatestVersion(this.name)
  }

  public async exists() {
    if (this.storePath) {
      await this.prepare()
      return pathExistsSync(this.cacheFilePath)
    }
    else { return pathExistsSync(this.targetPath) }
  }

  public async install() {
    await this.prepare()
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

  public async update() {
    await this.prepare()
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

  public getRootPath() {
    const dir = packageDirectorySync({ cwd: this.storePath ? this.cacheFilePath : this.targetPath })
    if (dir) {
      const pkg = require(path.resolve(dir, 'package.json'))
      return path.resolve(dir, pkg.main)
    }
    return ''
  }
}
