import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { genericComponent, useRender } from '@/util'

export const CCardActions = genericComponent()({
  name: 'CCardActions',

  props: makeComponentProps(),

  setup(props, { slots }) {
    provideDefaults({
      CBtn: {
        slim: true,
        variant: 'text',
      },
    })

    useRender(() => (
      <div
        class={[
          'v-card-actions',
          props.class,
        ]}
        style={props.style}
      >
        { slots.default?.() }
      </div>
    ))

    return {}
  },
})

export type CCardActions = InstanceType<typeof CCardActions>
