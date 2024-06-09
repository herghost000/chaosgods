import type { Ref, ShallowRef } from 'vue'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { SUPPORTS_INTERSECTION } from '@/util'

/**
 * 使用 IntersectionObserver 监听元素的可见性变化。
 *
 * @param {IntersectionObserverCallback} [callback] 可选的回调函数，当可见性变化时触发。
 * @param {IntersectionObserverInit} [options] 可选的配置选项。
 * @returns {object} 返回一个对象，包含 intersectionRef 和 isIntersecting。
 * @example
 * // 在组件中使用 useIntersectionObserver
 * import { ref } from 'vue';
 * import { useIntersectionObserver } from '@/composables/intersection';
 *
 * export default {
 *   setup() {
 *     // 调用 useIntersectionObserver 并传入回调函数和配置选项
 *     const { intersectionRef, isIntersecting } = useIntersectionObserver((entries, observer) => {
 *       // 在可见性变化时执行的回调逻辑
 *       console.log(entries);
 *       console.log(observer);
 *     }, {
 *       // 可选的配置选项
 *       root: null,
 *       rootMargin: '0px',
 *       threshold: 0.5,
 *     });
 *
 *     return { intersectionRef, isIntersecting };
 *   }
 * }
 */
export function useIntersectionObserver(callback?: IntersectionObserverCallback, options?: IntersectionObserverInit): {
  intersectionRef: Ref<HTMLElement | undefined>
  isIntersecting: ShallowRef<boolean>
} {
  const intersectionRef = ref<HTMLElement>()
  const isIntersecting = shallowRef(false)

  if (SUPPORTS_INTERSECTION) {
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      callback?.(entries, observer)

      isIntersecting.value = !!entries.find(entry => entry.isIntersecting)
    }, options)

    onBeforeUnmount(() => {
      observer.disconnect()
    })

    watch(intersectionRef, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(oldValue)
        isIntersecting.value = false
      }

      if (newValue)
        observer.observe(newValue)
    }, {
      flush: 'post',
    })
  }

  return { intersectionRef, isIntersecting }
}
