import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCListItemSubtitleProps = propsFactory({
  opacity: [Number, String],

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CListItemSubtitle')

export const CListItemSubtitle = genericComponent()({
  name: 'CListItemSubtitle',

  props: makeCListItemSubtitleProps(),

  setup(props, { slots }) {
    useRender(() => (
      <props.tag
        class={[
          'v-list-item-subtitle',
          props.class,
        ]}
        style={[
          { '--v-list-item-subtitle-opacity': props.opacity },
          props.style,
        ]}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CListItemSubtitle = InstanceType<typeof CListItemSubtitle>
