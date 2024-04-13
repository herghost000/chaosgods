import path from 'node:path'
import { readFile } from '../fs'

describe('cli/utils/fs.ts', () => {
  it('应该通过readFile读取package.json文件', async () => {
    const pkg = readFile(path.resolve('package.json'))
    expect(pkg).toBeDefined()
    expect(pkg).not.toBeNull()
    expect(pkg).toBeTypeOf('string')
  })

  it('应该通过writeFile写入文本到文件')
})
