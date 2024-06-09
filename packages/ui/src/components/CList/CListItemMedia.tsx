import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCListItemMediaProps = propsFactory({
  start: Boolean,
  end: Boolean,

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CListItemMedia')

export const CListItemMedia = genericComponent()({
  name: 'CListItemMedia',

  props: makeCListItemMediaProps(),

  setup(props, { slots }) {
    useRender(() => {
      return (
        <props.tag
          class={[
            'v-list-item-media',
            {
              'v-list-item-media--start': props.start,
              'v-list-item-media--end': props.end,
            },
            props.class,
          ]}
          style={props.style}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CListItemMedia = InstanceType<typeof CListItemMedia>
