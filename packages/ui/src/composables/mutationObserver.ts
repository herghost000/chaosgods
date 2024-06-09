import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComponentPublicInstance, Ref } from 'vue'
import { refElement } from '@/util'

/**
 * @zh 定义用于设置属性的突变选项。
 *
 * @interface MutationOptions
 * @property {boolean} [attr] 是否包括属性突变。
 * @property {boolean} [char] 是否包括字符突变。
 * @property {boolean} [child] 是否包括子节点突变。
 * @property {boolean} [sub] 是否包括子属性突变。
 * @property {boolean} [once] 是否只监听一次突变。
 * @property {boolean} [immediate] 是否立即执行监听函数。
 */
export interface MutationOptions {
  attr?: boolean
  char?: boolean
  child?: boolean
  sub?: boolean
  once?: boolean
  immediate?: boolean
}

/**
 * @zh 使用 MutationObserver 监听 DOM 变化。
 *
 * @param {MutationCallback} [handler] 变化处理函数。
 * @param {MutationOptions} [options] 监听选项。
 * @returns {{ mutationRef: Ref<ComponentPublicInstance | HTMLElement | undefined> }} 包含 DOM 元素的响应式引用。
 */
export function useMutationObserver(
  handler?: MutationCallback,
  options?: MutationOptions,
): { mutationRef: Ref<ComponentPublicInstance | HTMLElement | undefined> } {
  const mutationRef = ref<ComponentPublicInstance | HTMLElement>()
  const { once, immediate, ...optionKeys } = options || {}
  const defaultValue = !Object.keys(optionKeys).length

  const observer = new MutationObserver((
    mutations: MutationRecord[],
    observer: MutationObserver,
  ) => {
    handler?.(mutations, observer)

    if (options?.once)
      observer.disconnect()
  })

  onMounted(() => {
    if (!options?.immediate)
      return

    handler?.([], observer)
  })

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  watch(mutationRef, (newValue, oldValue) => {
    if (oldValue)
      observer.disconnect()

    const el = refElement(newValue)

    if (!el)
      return

    observer.observe(el, {
      attributes: options?.attr ?? defaultValue,
      characterData: options?.char ?? defaultValue,
      childList: options?.child ?? defaultValue,
      subtree: options?.sub ?? defaultValue,
    })
  }, {
    flush: 'post',
  })

  return { mutationRef }
}
