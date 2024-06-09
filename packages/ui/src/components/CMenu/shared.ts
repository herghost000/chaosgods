import type { InjectionKey } from 'vue'

interface MenuProvide {
  register: () => void
  unregister: () => void
  closeParents: (e?: MouseEvent) => void
}

export const CMenuSymbol: InjectionKey<MenuProvide> = Symbol.for('chaos:v-menu')
