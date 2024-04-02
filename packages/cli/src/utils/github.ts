import process from 'node:process'
import axios from 'axios'
import urlJoin from 'url-join'

const BASE_URL = process.env.CLI_BASE_URL ? process.env.CLI_BASE_URL : 'https://raw.githubusercontent.com/'

export function getFileRaw(account: string, repository: string, branch: string, filepath: string) {
  const apiUrl = urlJoin(BASE_URL, account, repository, branch, filepath)
  return axios.get(apiUrl).then((res) => {
    if (res.status === 200)
      return res.data

    return null
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export function getProjectTpls(): Promise<Record<string, string>[]> {
  return getFileRaw('herghost000', 'chaosgods', 'main', 'packages/cli/api/tpls.json')
}
