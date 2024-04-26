import path from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import fse from 'fs-extra'

export function readFile(path: string, options: { json?: boolean } = {}) {
  if (fse.pathExistsSync(path)) {
    const buffer = fse.readFileSync(path)
    if (buffer) {
      if (options.json)
        return JSON.stringify(buffer.toJSON())
      else
        return buffer.toString()
    }
    return null
  }
  return null
}

export function writeFile(path: string, data: string, options: { rewrite?: boolean } = { rewrite: true }) {
  if (fse.pathExistsSync(path)) {
    if (options.rewrite) {
      fse.writeFileSync(path, data)
      return true
    }
    return false
  }
  else {
    fse.writeFileSync(path, data)
    return true
  }
}

export function hasGlobalCmd(command: string) {
  const pathList = (process.env.PATH || '').split(path.delimiter) // process.env.PATH.split(path.delimiter)

  for (const dir of pathList) {
    const commandPath = path.join(dir, command)
    if (fs.existsSync(commandPath))
      return true
  }

  return false
}
