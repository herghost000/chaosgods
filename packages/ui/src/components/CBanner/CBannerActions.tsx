// Composables
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCBannerActionsProps = propsFactory({
  color: String,
  density: String,

  ...makeComponentProps(),
}, 'CBannerActions')

export const CBannerActions = genericComponent()({
  name: 'CBannerActions',

  props: makeCBannerActionsProps(),

  setup(props, { slots }) {
    provideDefaults({
      CBtn: {
        color: props.color,
        density: props.density,
        slim: true,
        variant: 'text',
      },
    })

    useRender(() => (
      <div
        class={[
          'v-banner-actions',
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

export type CBannerActions = InstanceType<typeof CBannerActions>
