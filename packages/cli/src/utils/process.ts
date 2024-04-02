import process from 'node:process'
import cp from 'node:child_process'

export function spawn(command: string, args: string[], options: cp.SpawnOptions) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options)
}

export function spawnAsync(command: string, args: string[], options: cp.SpawnOptions) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options)
    child.on('exit', () => resolve(0))
    child.on('error', (error) => {
      reject(error)
    })
  })
}
