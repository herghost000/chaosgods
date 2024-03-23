import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  externals: [
    'vue',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
