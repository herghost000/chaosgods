import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import { tsxAutoProps } from 'vite-plugin-tsx-auto-props'

const baseUrl = fileURLToPath(new URL('.', import.meta.url))
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // tsxAutoProps(),
    vitepressDemo({
      glob: ['**/demos/*.vue'],
    }),
    vueJsx(),
  ],
  resolve: {
    alias: [
      {
        // 我们复制我们的utils中的配置，直接修改一下
        find: /^chaos-ui/,
        // 然后再把utils替换成tov-ui，这样我们就完成了配置
        replacement: path.resolve(baseUrl, 'packages/chaos-ui/src'),
      },
      {
        // 我们通过正则表达式去匹配以@chaos-ui/utils的导入配置
        find: /^@chaos-ui\/utils/,
        // 然后我们把路径替换成绝对路径地址
        replacement: path.resolve(baseUrl, 'packages/utils/src'),
      },
      {
        // 我们通过正则表达式去匹配以@chaos-ui/icons
        find: /^@chaos-ui\/icons/,
        // 然后我们把路径替换成绝对路径地址
        replacement: path.resolve(baseUrl, 'packages/icons/src'),
      },
    ],
  },
})
