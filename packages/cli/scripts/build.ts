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
  target: 'node14',
  alias: {
    '@': path.resolve(baseUrl, '../src'),
  },
  plugins: [
    {
      name: 'alias',
      setup({ onResolve, resolve }) {
        onResolve({ filter: /^prompts$/, namespace: 'file' }, async ({ importer, resolveDir }) => {
          // we can always use non-transpiled code since we support 14.16.0+
          const result = await resolve('prompts/lib/index.js', {
            importer,
            resolveDir,
            kind: 'import-statement',
          })
          return result
        })
      },
    },
  ],
})
