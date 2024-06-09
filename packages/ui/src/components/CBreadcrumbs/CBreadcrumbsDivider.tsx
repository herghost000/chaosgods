// Composables
import { makeComponentProps } from '@/composables/component'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCBreadcrumbsDividerProps = propsFactory({
  divider: [Number, String],

  ...makeComponentProps(),
}, 'CBreadcrumbsDivider')

export const CBreadcrumbsDivider = genericComponent()({
  name: 'CBreadcrumbsDivider',

  props: makeCBreadcrumbsDividerProps(),

  setup(props, { slots }) {
    useRender(() => (
      <li
        class={[
          'v-breadcrumbs-divider',
          props.class,
        ]}
        style={props.style}
      >
        { slots?.default?.() ?? props.divider }
      </li>
    ))

    return {}
  },
})

export type CBreadcrumbsDivider = InstanceType<typeof CBreadcrumbsDivider>
