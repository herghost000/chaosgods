import { CLabel } from '@/components/CLabel'
import { makeComponentProps } from '@/composables/component'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCFieldLabelProps = propsFactory({
  floating: Boolean,

  ...makeComponentProps(),
}, 'CFieldLabel')

export const CFieldLabel = genericComponent()({
  name: 'CFieldLabel',

  props: makeCFieldLabelProps(),

  setup(props, { slots }) {
    useRender(() => (
      <CLabel
        class={[
          'v-field-label',
          { 'v-field-label--floating': props.floating },
          props.class,
        ]}
        style={props.style}
        aria-hidden={props.floating || undefined}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CFieldLabel = InstanceType<typeof CFieldLabel>
