import './styles/main.sass'
import * as blueprints from './blueprints'
import * as components from './components'
import * as directives from './directives'
import { createChaos as _createChaos } from './framework'
import type { ChaosOptions } from './framework'

export function createChaos(options: ChaosOptions = {}) {
  return _createChaos({ components, directives, ...options })
}

export const version = __VUETIFY_VERSION__
createChaos.version = version

export {
  blueprints,
  components,
  directives,
}
export * from './composables'
