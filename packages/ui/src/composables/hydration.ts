import type { ShallowRef } from 'vue'
import { onMounted, shallowRef } from 'vue'
import { useDisplay } from '@/composables/display'
import { IN_BROWSER } from '@/util'

/**
 * @zh 在 Vue 应用中管理水合状态。
 *
 * @returns {Ref<boolean>} 表示水合状态的 shallowRef。
 */
export function useHydration(): ShallowRef<boolean> {
  if (!IN_BROWSER)
    return shallowRef(false)

  const { ssr } = useDisplay()

  if (ssr) {
    const isMounted = shallowRef(false)
    onMounted(() => {
      isMounted.value = true
    })
    return isMounted
  }
  else {
    return shallowRef(true)
  }
}
