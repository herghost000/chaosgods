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

export interface GitRepository {
  name: string
  full_name: string
  html_url: string
}

export interface GiteeRepository {
  name: string
  full_name: string
  html_url: string
}

export interface GithubRepository {
  name: string
  full_name: string
  html_url: string
}
