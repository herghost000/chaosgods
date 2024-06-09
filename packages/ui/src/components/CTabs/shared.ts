import type { InjectionKey } from 'vue'
import type { GroupProvide } from '@/composables/group'

export const CTabsSymbol: InjectionKey<GroupProvide> = Symbol.for('chaos:v-tabs')
