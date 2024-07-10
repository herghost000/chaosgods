import process from 'node:process'
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)

let child

if (process.platform === 'win32')
  child = spawn('pnpm', ['test:unix', ...args], { stdio: 'inherit' })
else
  child = spawn('pnpm', ['test:unix', ...args], { stdio: 'inherit' })

child.on('exit', process.exit)
