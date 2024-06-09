import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCToolbarTitleProps = propsFactory({
  text: String,

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CToolbarTitle')

export type CToolbarTitleSlots = {
  default: never
  text: never
}

export const CToolbarTitle = genericComponent<CToolbarTitleSlots>()({
  name: 'CToolbarTitle',

  props: makeCToolbarTitleProps(),

  setup(props, { slots }) {
    useRender(() => {
      const hasText = !!(slots.default || slots.text || props.text)

      return (
        <props.tag
          class={[
            'v-toolbar-title',
            props.class,
          ]}
          style={props.style}
        >
          { hasText && (
            <div class="v-toolbar-title__placeholder">
              { slots.text ? slots.text() : props.text }

              { slots.default?.() }
            </div>
          )}
        </props.tag>
      )
    })

    return {}
  },
})

export type CToolbarTitle = InstanceType<typeof CToolbarTitle>
