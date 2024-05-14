import process from 'node:process'
import { cosmiconfigSync } from 'cosmiconfig'
import { parse } from '@iarna/toml'
import { defaultsDeep, get, isPlainObject, merge } from 'lodash'
import isCI from 'is-ci'
import type { ConfigOptions, DefaultConfig, LocalConfig } from './types'
import defaultConfig from '@/../config/chaos.json'

const searchPlaces = [
  'package.json',
  '.chaos.json',
  '.chaos.js',
  '.chaos.cjs',
  '.chaos.yaml',
  '.chaos.yml',
  '.chaos.toml',
]

const loaders = {
  '.toml': (_: string, content: string) => parse(content),
}

/**
 * @zh 获取用户本地配置
 *
 * @export
 * @param {string} [file] 配置文件路径
 * @param {string} [dir] 配置文件查询目录
 * @return {*}  {LocalConfig}
 */
export function getLocalConfig(file: string = '', dir: string = process.cwd()): LocalConfig {
  const localConfig = {}
  if (!file)
    return localConfig
  const explorer = cosmiconfigSync('chaos', {
    searchPlaces,
    loaders,
  })
  const result = file ? explorer.load(file as string) : explorer.search(dir)
  if (result && typeof result.config === 'string')
    throw new Error(`Invalid configuration file at ${result.filepath}`)

  return result && isPlainObject(result.config) ? result.config : localConfig
}

export default class Config {
  // SECTION Properties
  /**
   * @zh 创建实例时传入的配置选项
   *
   * @type {ConfigOptions}
   * @memberof Config
   */
  public originalConfig: ConfigOptions

  /**
   * @zh 用户本地配置文件中的配置选项
   *
   * @type {LocalConfig}
   * @memberof Config
   */
  public localConfig: LocalConfig

  /**
   * @zh 最终的配置选项
   *
   * @type {ConfigOptions}
   * @memberof Config
   */
  public options: ConfigOptions

  public contextOptions: ConfigOptions = {}
  // !SECTION

  // SECTION Getters
  /**
   * @zh 默认配置
   * @en default config
   *
   * @readonly
   * @memberof Config
   */
  public get defaultConfig(): DefaultConfig {
    return defaultConfig as unknown as DefaultConfig
  }

  public get isDryRun(): boolean {
    return Boolean(this.options['dry-run'])
  }

  public get isIncrement() {
    return Boolean(this.options.increment)
  }

  /**
   * @zh 是否在CI环境中运行
   *
   * @readonly
   * @memberof Config
   */
  public get isCI() {
    return Boolean(this.options.ci) || this.isReleaseVersion || this.isChangelog
  }

  public get isPromptOnlyVersion(): boolean {
    return Boolean(this.options['only-version'])
  }

  public get isReleaseVersion() {
    return Boolean(this.options['release-version'])
  }

  public get isChangelog(): boolean {
    return Boolean(this.options.changelog)
  }
  // !SECTION

  constructor(config: ConfigOptions = {}) {
    this.originalConfig = config
    this.localConfig = getLocalConfig(config.file, config.dir)
    this.options = this.mergeOptions()
    this.options = this.expandPreReleaseShorthand(this.options)
  }

  /**
   * @zh 扩展预发行版本的简写
   * @en A function that expands shorthand notation for pre-releases.
   *
   * @param {ConfigOptions} options - 要展开的配置选项。
   * @return {ConfigOptions} 扩展后更新的配置选项。
   */
  public expandPreReleaseShorthand(options: ConfigOptions): ConfigOptions {
    const { increment, preRelease, preReleaseId, snapshot } = options
    const isPreRelease = Boolean(preRelease) || Boolean(snapshot)
    const inc = snapshot ? 'prerelease' : increment
    const preId = typeof preRelease === 'string' ? preRelease : typeof snapshot === 'string' ? snapshot : preReleaseId
    options.version = {
      increment: inc,
      isPreRelease,
      preReleaseId: preId,
    }
    if (typeof snapshot === 'string' && options.git) {
      // NOTE 预设和硬编码一些选项
      if (options.git) {
        options.git.tagMatch = `0.0.0-${snapshot}.[0-9]*`
        options.git.getLatestTagFromAllRefs = true
        options.git.requireBranch = '!main'
        options.git.requireUpstream = false
      }
      if (options.npm)
        options.npm.ignoreVersion = true
    }
    return options
  }

  /**
   * @zh 合并配置选项，分配默认属性
   *
   * @return {*}  {ConfigOptions}
   * @memberof Config
   */
  public mergeOptions(): ConfigOptions {
    return defaultsDeep(
      {},
      this.originalConfig,
      {
        ci: isCI,
      },
      this.localConfig,
      this.defaultConfig,
    )
  }

  public getParam<T = any>(path: string | string[]): T {
    const context = this.getContext()
    return get(context, path)
  }

  /**
   * @zh 获取上下文中的配置选项，通过上下文配置合并到最终配置
   *
   * @return {*}  {ConfigOptions}
   * @memberof Config
   */
  public getContext(): ConfigOptions {
    return merge({}, this.options, this.contextOptions)
  }

  /**
   * @zh 设置上下文中的配置选项，通过新配置选项合并到上下文配置选项
   *
   * @param {ConfigOptions} options
   * @memberof Config
   */
  public setContext(options: ConfigOptions): void {
    merge(this.contextOptions, options)
  }

  /**
   * 手动设置是否在CI环境中运行
   *
   * @param {boolean} [value]
   * @memberof Config
   */
  public setCI(value: boolean): void {
    this.options.ci = value
  }
}
