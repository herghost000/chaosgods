import './CLabel.sass'
import { makeComponentProps } from '@/composables/component'
import { makeThemeProps } from '@/composables/theme'
import { EventProp, genericComponent, propsFactory, useRender } from '@/util'

export const makeCLabelProps = propsFactory({
  text: String,

  onClick: EventProp<[MouseEvent]>(),

  ...makeComponentProps(),
  ...makeThemeProps(),
}, 'CLabel')

export const CLabel = genericComponent()({
  name: 'CLabel',

  props: makeCLabelProps(),

  setup(props, { slots }) {
    useRender(() => (
      <label
        class={[
          'v-label',
          {
            'v-label--clickable': !!props.onClick,
          },
          props.class,
        ]}
        style={props.style}
        onClick={props.onClick}
      >
        { props.text }

        { slots.default?.() }
      </label>
    ))

    return {}
  },
})

export type CLabel = InstanceType<typeof CLabel>
