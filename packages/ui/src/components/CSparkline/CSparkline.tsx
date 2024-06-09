import { computed, toRef } from 'vue'
import type { PropType } from 'vue'
import { CBarline, makeCBarlineProps } from './CBarline'
import { CTrendline, makeCTrendlineProps } from './CTrendline'
import { useTextColor } from '@/composables/color'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCSparklineProps = propsFactory({
  type: {
    type: String as PropType<'trend' | 'bar'>,
    default: 'trend',
  },

  ...makeCBarlineProps(),
  ...makeCTrendlineProps(),
}, 'CSparkline')

export type CSparklineSlots = {
  default: void
  label: { index: number, value: string }
}

export const CSparkline = genericComponent<CSparklineSlots>()({
  name: 'CSparkline',

  props: makeCSparklineProps(),

  setup(props, { slots }) {
    const { textColorClasses, textColorStyles } = useTextColor(toRef(props, 'color'))
    const hasLabels = computed(() => {
      return Boolean(
        props.showLabels
        || props.labels.length > 0
        || !!slots?.label,
      )
    })
    const totalHeight = computed(() => {
      let height = Number.parseInt(`${props.height}`, 10)

      if (hasLabels.value)
        height += Number.parseInt(`${props.labelSize}`, 10) * 1.5

      return height
    })

    useRender(() => {
      const Tag = props.type === 'trend' ? CTrendline : CBarline
      const lineProps = props.type === 'trend' ? CTrendline.filterProps(props) : CBarline.filterProps(props)

      return (
        <Tag
          key={props.type}
          class={textColorClasses.value}
          style={textColorStyles.value}
          viewBox={`0 0 ${props.width} ${Number.parseInt(`${totalHeight.value}`, 10)}`}
          {...lineProps}
          v-slots={slots}
        />
      )
    })
  },
})

export type CSparkline = InstanceType<typeof CSparkline>
