import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCListItemActionProps = propsFactory({
  start: Boolean,
  end: Boolean,

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CListItemAction')

export const CListItemAction = genericComponent()({
  name: 'CListItemAction',

  props: makeCListItemActionProps(),

  setup(props, { slots }) {
    useRender(() => (
      <props.tag
        class={[
          'v-list-item-action',
          {
            'v-list-item-action--start': props.start,
            'v-list-item-action--end': props.end,
          },
          props.class,
        ]}
        style={props.style}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CListItemAction = InstanceType<typeof CListItemAction>
