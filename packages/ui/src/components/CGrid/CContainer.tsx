import './CGrid.sass'
import { makeComponentProps } from '@/composables/component'
import { useRtl } from '@/composables/locale'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCContainerProps = propsFactory({
  fluid: {
    type: Boolean,
    default: false,
  },

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CContainer')

export const CContainer = genericComponent()({
  name: 'CContainer',

  props: makeCContainerProps(),

  setup(props, { slots }) {
    const { rtlClasses } = useRtl()

    useRender(() => (
      <props.tag
        class={[
          'v-container',
          { 'v-container--fluid': props.fluid },
          rtlClasses.value,
          props.class,
        ]}
        style={props.style}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CContainer = InstanceType<typeof CContainer>
