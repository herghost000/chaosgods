import { computed, inject, provide, shallowRef } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export const DepthKey: InjectionKey<Ref<number>> = Symbol.for('chaos:depth')

export function useDepth(hasPrepend?: Ref<boolean>) {
  const parent = inject(DepthKey, shallowRef(-1))

  const depth = computed(() => parent.value + 1 + (hasPrepend?.value ? 1 : 0))

  provide(DepthKey, depth)

  return depth
}

export const ListKey: InjectionKey<{
  hasPrepend: Ref<boolean>
  updateHasPrepend: (value: boolean) => void
}> = Symbol.for('chaos:list')

export function createList() {
  const parent = inject(ListKey, { hasPrepend: shallowRef(false), updateHasPrepend: () => null })

  const data = {
    hasPrepend: shallowRef(false),
    updateHasPrepend: (value: boolean) => {
      if (value)
        data.hasPrepend.value = value
    },
  }

  provide(ListKey, data)

  return parent
}

export function useList() {
  return inject(ListKey, null)
}
