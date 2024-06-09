import './CLayoutItem.sass'
import { computed, toRef } from 'vue'
import type { PropType } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCLayoutItemProps = propsFactory({
  position: {
    type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 300,
  },
  modelValue: Boolean,

  ...makeComponentProps(),
  ...makeLayoutItemProps(),
}, 'CLayoutItem')

export const CLayoutItem = genericComponent()({
  name: 'CLayoutItem',

  props: makeCLayoutItemProps(),

  setup(props, { slots }) {
    const { layoutItemStyles, layoutIsReady } = useLayoutItem({
      id: props.name,
      order: computed(() => Number.parseInt(`${props.order}`, 10)),
      position: toRef(props, 'position'),
      elementSize: toRef(props, 'size'),
      layoutSize: toRef(props, 'size'),
      active: toRef(props, 'modelValue'),
      absolute: toRef(props, 'absolute'),
    })

    useRender(() => (
      <div
        class={[
          'v-layout-item',
          props.class,
        ]}
        style={[
          layoutItemStyles.value,
          props.style,
        ]}
      >
        { slots.default?.() }
      </div>
    ))

    return layoutIsReady
  },
})

export type CLayoutItem = InstanceType<typeof CLayoutItem>
