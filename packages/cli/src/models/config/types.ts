export interface GithubComments {
  submit: boolean
  issue: string
  pr: string
}

export interface GithubConfig {
  release: boolean
  releaseName: string
  releaseNotes: string
  autoGenerate: boolean
  preRelease: boolean
  draft: boolean
  tokenRef: string
  assets: string
  host: string
  timeout: number
  proxy: string
  skipChecks: boolean
  web: boolean
  comments: GithubComments
}

export interface GitlabConfig {
  release: boolean
  releaseName: string
  releaseNotes: string
  milestones: string[]
  tokenRef: string
  tokenHeader: string
  certificateAuthorityFile: string
  assets: string
  origin: string
  skipChecks: boolean
}

export interface GitConfig {
  changelog: string
  requireCleanWorkingDir: boolean
  requireBranch: string
  requireUpstream: boolean
  requireCommits: boolean
  requireCommitsFail: boolean
  commitsPath: string
  addUntrackedFiles: boolean
  commit: boolean
  commitMessage: string
  commitArgs: []
  tag: boolean
  tagExclude: string
  tagName: string
  tagMatch: string
  getLatestTagFromAllRefs: boolean
  tagAnnotation: string
  tagArgs: []
  push: boolean
  pushArgs: string[]
  pushRepo: string
}

export interface NpmConfig {
  publish: boolean
  publishPath: string
  publishArgs: string[]
  tag: string
  otp: string
  ignoreVersion: boolean
  allowSameVersion: boolean
  versionArgs: string[]
  skipChecks: boolean
  timeout: number
}

export interface DefaultConfig {
  hooks?: any
  git?: GitConfig
  npm?: NpmConfig
  github?: GithubConfig
  gitlab?: GitlabConfig
}

export type LocalConfig = DefaultConfig

export interface ConfigOptions extends DefaultConfig {
  file?: string
  dir?: string
  version?: {
    increment?: string
    isPreRelease?: boolean
    preReleaseId?: string
  }
  ci?: boolean
  increment?: string
  preRelease?: string
  preReleaseId?: string
  snapshot?: string
  ['only-version']?: boolean
  ['release-version']?: boolean
  ['dry-run']?: boolean
  changelog?: boolean
}
