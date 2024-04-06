export interface GitOptions {
  name?: string
  version?: string
  dir?: string
  refreshServer?: boolean
  refreshToken?: boolean
  refreshOwner?: boolean
}

export interface GiteeUser {
  login: string
}

export interface GithubUser {
  login: string
}

export interface GitUser {
  login: string
}

export interface GiteeOrg {
  login: string
}

export interface GithubOrg {
  login: string
}

export interface GitOrg {
  login: string
}
