import { CWindowItem, makeCWindowItemProps } from '@/components/CWindow/CWindowItem'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCStepperWindowItemProps = propsFactory({
  ...makeCWindowItemProps(),
}, 'CStepperWindowItem')

export const CStepperWindowItem = genericComponent()({
  name: 'CStepperWindowItem',

  props: makeCStepperWindowItemProps(),

  setup(props, { slots }) {
    useRender(() => {
      const windowItemProps = CWindowItem.filterProps(props)

      return (
        <CWindowItem
          _as="CStepperWindowItem"
          {...windowItemProps}
          class={[
            'v-stepper-window-item',
            props.class,
          ]}
          style={props.style}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CStepperWindowItem = InstanceType<typeof CStepperWindowItem>
