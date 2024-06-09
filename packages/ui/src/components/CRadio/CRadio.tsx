import { CSelectionControl, makeCSelectionControlProps } from '@/components/CSelectionControl/CSelectionControl'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CSelectionControlSlots } from '@/components/CSelectionControl/CSelectionControl'

export const makeCRadioProps = propsFactory({
  ...makeCSelectionControlProps({
    falseIcon: '$radioOff',
    trueIcon: '$radioOn',
  }),
}, 'CRadio')

export const CRadio = genericComponent<CSelectionControlSlots>()({
  name: 'CRadio',

  props: makeCRadioProps(),

  setup(props, { slots }) {
    useRender(() => (
      <CSelectionControl
        {...props}
        class={[
          'v-radio',
          props.class,
        ]}
        style={props.style}
        type="radio"
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CRadio = InstanceType<typeof CRadio>
