import { onBeforeUpdate, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * @zh 创建一个用于管理多个引用的工具函数。
 *
 * @template T - 引用类型。
 * @returns {{ refs: Ref<(T | undefined)[]>; updateRef: (e: any, i: number) => void; }} 包含引用数组和更新引用的函数。
 */
export function useRefs<T extends {}>(): {
  refs: Ref<(T | undefined)[]>
  updateRef: (e: any, i: number) => void
} {
  const refs = ref<(T | undefined)[]>([]) as Ref<(T | undefined)[]>

  onBeforeUpdate(() => (refs.value = []))

  function updateRef(e: any, i: number) {
    refs.value[i] = e
  }

  return { refs, updateRef }
}
