import axios from 'axios'
import urlJoin from 'url-join'

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

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.com/' : 'https://registry.npm.taobao.org'
}
