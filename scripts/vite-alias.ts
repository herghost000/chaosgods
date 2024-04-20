import path from 'node:path'
import { fileURLToPath } from 'node:url'

const baseUrl = fileURLToPath(new URL('../', import.meta.url))

export default [
  {
    find: /^@chaosgods\/(.*)\//,
    replacement: path.resolve(baseUrl, 'packages/$1/src'),
  },
]
