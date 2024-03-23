import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import fs from 'fs-extra'

export default defineConfig({
  plugins: [
    {
      // nam我们随便写
      name: 'remove:chaosgods-ui-style.js',
      // 我们要删除文件的话，我们需要在所有的文件生成完成后删除
      // 所以我们这里就在closeBundle这个钩子的时候删除
      closeBundle() {
        // 首先我们先获取文件
        const umdPath = fileURLToPath(new URL('./umd', import.meta.url))
        // 找到我们的js文件
        const stylePath = path.resolve(umdPath, 'chaosgods-ui-style.js')
        // 删除他
        fs.removeSync(stylePath)
      },
    },
  ],
  build: {
    // 这里我们需要设置他不要清空我们的dist目录
    emptyOutDir: false,
    // 我们配置一下我们css的输出名字
    rollupOptions: {
      output: {
        assetFileNames: () => 'chaosgods-ui.css',
        dir: 'umd',
      },
    },
    lib: {
      // 输入就是我们的src下面创建的styles.ts文件
      entry: 'src/styles.ts',
      // 我们采用es的模式来输出，这里哪种模式都可以，但是es配置比较简单
      formats: ['es'],
      // 默认情况下他会输出一个js的文件，我们这里定义一下输出的js的名字
      fileName: () => 'chaosgods-ui-style.js',
    },
  },
})
