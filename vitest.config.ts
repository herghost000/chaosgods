import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      coverage: {
        include: ['packages/**', '!packages/**/docs', '!packages/**/demos'],
      },
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
