// Types
import type { ComputedRef, InjectionKey } from 'vue'

export interface TreeViewProvide {
  visibleIds: ComputedRef<Set<unknown> | null>
}

export const CTreeviewSymbol: InjectionKey<TreeViewProvide> = Symbol.for('vuetify:v-treeview')
