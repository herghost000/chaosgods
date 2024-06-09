import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { getCurrentInstanceName, propsFactory } from '@/util'

type RoundedValue = boolean | string | number | null | undefined

export interface RoundedProps {
  /** 圆角属性。 */
  rounded?: RoundedValue
  /** 是否使用瓷砖样式。 */
  tile?: boolean
}

interface RoundedData {
  roundedClasses: Ref<string[]>
}

export const makeRoundedProps = propsFactory({
  rounded: {
    type: [Boolean, Number, String],
    default: undefined,
  },
  tile: Boolean,
}, 'rounded')

/**
 * @zh 使用 props 或 ref 创建一个包含圆角类的对象。
 *
 * @param {RoundedProps | Ref<RoundedValue>} props 用于获取圆角属性的 props 或 ref。
 * @param {string} [name] 当前实例的名称。
 * @returns {RoundedData} 包含圆角类的对象。
 */
export function useRounded(
  props: RoundedProps | Ref<RoundedValue>,
  name: string = getCurrentInstanceName(),
): RoundedData {
  const roundedClasses = computed(() => {
    const rounded = isRef(props) ? props.value : props.rounded
    const tile = isRef(props) ? props.value : props.tile
    const classes: string[] = []

    if (rounded === true || rounded === '') {
      classes.push(`${name}--rounded`)
    }
    else if (
      typeof rounded === 'string'
      || rounded === 0
    ) {
      for (const value of String(rounded).split(' '))
        classes.push(`rounded-${value}`)
    }
    else if (tile || rounded === false) {
      classes.push('rounded-0')
    }

    return classes
  })

  return { roundedClasses }
}
