import path from 'node:path'
import fs, { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import fg from 'fast-glob'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteSSR from 'vite-ssr/plugin.js'
import Components from 'unplugin-vue-components/vite'
import { warmup } from 'vite-plugin-warmup'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = file => path.resolve(__dirname, file)

const chaosPackage = fs.readFileSync('./package.json', 'utf-8')

const index = readFileSync(resolve('src/components/index.ts'), { encoding: 'utf8' })
const block = Array.from(index.matchAll(/^\/\/ export \* from '\.\/(.*)'$/gm), m => m[1])
const files = fg.sync(['src/components/**/index.ts', 'src/labs/**/index.ts'], { cwd: __dirname })
const components = files.filter(file => file.startsWith('src/labs') || !block.some(name => file.includes(`/${name}/`)))
const map = new Map(components.flatMap((file) => {
  const src = readFileSync(file, { encoding: 'utf8' })
  const matches = src.matchAll(/export const (V\w+)|export { (V\w+) }/gm)
  return Array.from(matches, m => [m[1] || m[2], file.replace('src/', '@/').replace('.ts', '')])
}))

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    root: resolve('dev'),
    server: {
      host: process.env.HOST,
      port: process.env.CYPRESS ? undefined : +(process.env.PORT ?? 8090),
      strictPort: !!process.env.PORT && !process.env.CYPRESS,
    },
    preview: {
      host: process.env.HOST,
      port: +(process.env.PORT ?? 8090),
      strictPort: !!process.env.PORT,
    },
    resolve: {
      alias: [
        { find: /^chaos$/, replacement: resolve('./src/framework.ts') },
        { find: /^chaos\/(.*)/, replacement: resolve('./$1') },
        { find: /^@\/(.*)/, replacement: resolve('./src/$1') },
      ],
    },
    plugins: [
      vue(),
      vueJsx({ optimize: false, enableObjectSlots: false }),
      viteSSR(),
      Components({
        dts: !process.env.CYPRESS,
        resolvers: [
          (name) => {
            if (map.has(name))
              return { name, from: map.get(name) }
          },
        ],
      }),
      warmup({
        clientFiles: process.env.CYPRESS
          ? [
              './src/**/*.spec.cy.{js,jsx,ts,tsx}',
              './cypress/support/index.ts',
            ]
          : [
              './dev/index.html',
            ],
      }),
    ],
    define: {
      '__VUETIFY_VERSION__': JSON.stringify(chaosPackage.version),
      'process.env.BABEL_TYPES_8_BREAKING': 'false',
      'process.env.VITE_SSR': process.env.VITE_SSR,
    },
    build: {
      minify: false,
    },
  }
})
