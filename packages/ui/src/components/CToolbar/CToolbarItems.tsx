import { toRef } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeVariantProps } from '@/composables/variant'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCToolbarItemsProps = propsFactory({
  ...makeComponentProps(),
  ...makeVariantProps({ variant: 'text' } as const),
}, 'CToolbarItems')

export const CToolbarItems = genericComponent()({
  name: 'CToolbarItems',

  props: makeCToolbarItemsProps(),

  setup(props, { slots }) {
    provideDefaults({
      CBtn: {
        color: toRef(props, 'color'),
        height: 'inherit',
        variant: toRef(props, 'variant'),
      },
    })

    useRender(() => (
      <div
        class={[
          'v-toolbar-items',
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

export type CToolbarItems = InstanceType<typeof CToolbarItems>
