/// <reference types="vitest" />
import { fileURLToPath } from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import vue from '@vitejs/plugin-vue'
import { uiResolver } from './scripts/ui-resolver'
import viteAlias from './scripts/vite-alias'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
    vue(),
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
})
