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
