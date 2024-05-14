import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const baseUrl = fileURLToPath(new URL('./', import.meta.url))

await esbuild.build({
  bundle: true,
  entryPoints: ['index.ts'],
  external: [
    'npminstall',
    'npmlog',
    'axios',
    'colors',
    'commander',
    'dotenv',
    'fs-extra',
    'import-local',
    'node-homedir',
    // 'pkg-dir',
    'prompts',
    // 'root-check',
    'semver',
    // 'url-join',
    // 'locales/*'
    '@inquirer/prompts',
    'simple-git',
    // 'ora',
    'glob',
    'ejs',
    'gradient-string',
  ],
  outfile: 'outfile.cjs',
  format: 'cjs',
  platform: 'node',
  minify: false,
  target: 'node16',
  alias: {
    '@': path.resolve(baseUrl, '../src'),
  },
})
