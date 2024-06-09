import * as components from './allComponents'
import * as directives from '@/directives'
import { createChaos as _createChaos } from '@/framework'
import type { ChaosOptions } from '@/framework'

export * from '@/entry-bundler'
export { components }

export function createChaos(options: ChaosOptions = {}) {
  return _createChaos({ components, directives, ...options })
}
