/// <reference types="vitest" />

import { fileURLToPath } from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import vue from '@vitejs/plugin-vue'
import { uiResolver } from './scripts/ui-resolver'
import viteAlias from './scripts/vite-alias'

function buildBasePlugins(): PluginOption[] {
  return [
    Components({
      dts: true,
      resolvers: [
        uiResolver(),
      ],
    }),
    vitepressDemo({
      glob: ['**/demos/*.vue'],
    }),
    vueJsx(),
  ]
}

function buildVitestPlugins(mode: string): PluginOption[] {
  if (mode !== 'test')
    return []

  return [
    vue(),
  ]
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      ...buildBasePlugins(),
      ...buildVitestPlugins(mode),
    ],
    resolve: {
      alias: viteAlias,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      coverage: {
        include: ['packages/**', '!packages/**/docs', '!packages/**/demos'],
      },
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }
})
