import type { ComponentResolver } from 'unplugin-vue-components'

export function uiResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve(name) {
      if (name.startsWith('C')) {
        return {
          name: name.slice(1),
          from: '@chaosgods/ui',
        }
      }
    },
  }
}
