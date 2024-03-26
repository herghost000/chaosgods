import axios from 'axios'
import urlJoin from 'url-join'
import { gt, satisfies } from 'semver'

export function getPackageInfo(pkgName: string, registry?: string) {
  if (!pkgName)
    return null
  registry = registry ?? getDefaultRegistry()
  const apiUrl = urlJoin(registry, pkgName)
  return axios.get(apiUrl).then((res) => {
    if (res.status === 200)
      return res.data

    return null
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.com/' : 'https://registry.npm.taobao.org'
}

export async function getPackageVersions(pkgName: string, registry?: string) {
  const data = await getPackageInfo(pkgName, registry)
  if (data)
    return Object.keys(data.versions)
  else
    return []
}

export function filterSemverVersions(baseVersion: string, versions: string[]) {
  return versions.filter(version => satisfies(version, `~${baseVersion}`)).sort((a, b) => gt(b, a) ? 1 : -1)
}

export async function getSemverVersion(baseVersion: string, pkgName: string, registry?: string) {
  const versions = await getPackageVersions(pkgName, registry)
  const semverVersions = filterSemverVersions(baseVersion, versions)
  if (semverVersions && semverVersions.length > 0 && gt(semverVersions[0], baseVersion))
    return semverVersions[0]

  return ''
}

export async function getLatestVersion(pkgName: string, registry?: string) {
  const versions = (await getPackageVersions(pkgName, registry) || []).sort((a, b) => gt(b, a) ? 1 : -1)
  return versions[0]
}
