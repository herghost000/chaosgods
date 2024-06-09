import { onBeforeUnmount, readonly, ref, watch } from 'vue'
import type { DeepReadonly, Ref } from 'vue'
import { templateRef } from '@/util'
import { IN_BROWSER } from '@/util/globals'
import type { TemplateRef } from '@/util'

interface ResizeState {
  resizeRef: TemplateRef
  contentRect: DeepReadonly<Ref<DOMRectReadOnly | undefined>>
}

/**
 * @zh 使用 ResizeObserver 监听元素大小变化，并返回一个包含 resizeRef 和 contentRect 的状态对象。
 *
 * @param {ResizeObserverCallback} [callback] 当尺寸变化时的回调函数。
 * @param {'content' | 'border'} [box] 指定要获取的矩形框类型。
 * @returns {ResizeState} 包含 resizeRef 和 contentRect 的状态对象。
 */
export function useResizeObserver(callback?: ResizeObserverCallback, box: 'content' | 'border' = 'content'): ResizeState {
  const resizeRef = templateRef()
  const contentRect = ref<DOMRectReadOnly>()

  if (IN_BROWSER) {
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      callback?.(entries, observer)

      if (!entries.length)
        return

      if (box === 'content')
        contentRect.value = entries[0].contentRect
      else
        contentRect.value = entries[0].target.getBoundingClientRect()
    })

    onBeforeUnmount(() => {
      observer.disconnect()
    })

    watch(() => resizeRef.el, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(oldValue)
        contentRect.value = undefined
      }

      if (newValue)
        observer.observe(newValue)
    }, {
      flush: 'post',
    })
  }

  return {
    resizeRef,
    contentRect: readonly(contentRect),
  }
}
