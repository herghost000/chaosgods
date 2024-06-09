// Composables
import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCardTextProps = propsFactory({
  opacity: [Number, String],

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CCardText')

export const CCardText = genericComponent()({
  name: 'CCardText',

  props: makeCCardTextProps(),

  setup(props, { slots }) {
    useRender(() => (
      <props.tag
        class={[
          'v-card-text',
          props.class,
        ]}
        style={[
          { '--v-card-text-opacity': props.opacity },
          props.style,
        ]}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CCardText = InstanceType<typeof CCardText>
