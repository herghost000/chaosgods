import { computed } from 'vue'
import type { ComputedRef, PropType } from 'vue'
import { getCurrentInstanceName, propsFactory } from '@/util'

const positionValues = ['static', 'relative', 'fixed', 'absolute', 'sticky'] as const

type Position = typeof positionValues[number]

export interface PositionProps {
  position: Position | undefined
}

export const makePositionProps = propsFactory({
  position: {
    type: String as PropType<Position>,
    validator: /* istanbul ignore next */ (v: any) => positionValues.includes(v),
  },
}, 'position')

/**
 * @zh 创建一个基于位置属性生成的类名对象。
 *
 * @export
 * @param {PositionProps} props 位置属性对象。
 * @param {string} [name] 组件实例名称。
 * @return {{ positionClasses: ComputedRef<string | undefined> }}  包含位置类名的对象。
 */
export function usePosition(
  props: PositionProps,
  name: string = getCurrentInstanceName(),
): {
    positionClasses: ComputedRef<string | undefined>
  } {
  const positionClasses = computed(() => {
    return props.position ? `${name}--${props.position}` : undefined
  })

  return { positionClasses }
}
