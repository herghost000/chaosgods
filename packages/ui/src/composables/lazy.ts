import { computed, shallowRef, watch } from 'vue'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { propsFactory } from '@/util'

export const makeLazyProps = propsFactory({
  eager: Boolean,
}, 'lazy')

/**
 * @zh 创建一个延迟加载的逻辑。
 *
 * @export
 * @param {{ eager: boolean }} props 组件的属性对象，包含 eager 属性，表示是否立即加载内容。
 * @param {Ref<boolean>} active 表示组件是否处于激活状态的引用。
 * @return {*}  {{ isBooted: ShallowRef<boolean> hasContent: ComputedRef<boolean> onAfterLeave: () => void }} 返回一个对象，包含 isBooted、hasContent 和 onAfterLeave 方法。
 */
export function useLazy(props: { eager: boolean }, active: Ref<boolean>): {
  isBooted: ShallowRef<boolean>
  hasContent: ComputedRef<boolean>
  onAfterLeave: () => void
} {
  const isBooted = shallowRef(false)
  const hasContent = computed(() => isBooted.value || props.eager || active.value)

  watch(active, () => isBooted.value = true)

  function onAfterLeave() {
    if (!props.eager)
      isBooted.value = false
  }

  return { isBooted, hasContent, onAfterLeave }
}
