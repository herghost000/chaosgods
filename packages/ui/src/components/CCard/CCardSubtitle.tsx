import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCardSubtitleProps = propsFactory({
  opacity: [Number, String],

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CCardSubtitle')

export const CCardSubtitle = genericComponent()({
  name: 'CCardSubtitle',

  props: makeCCardSubtitleProps(),

  setup(props, { slots }) {
    useRender(() => (
      <props.tag
        class={[
          'v-card-subtitle',
          props.class,
        ]}
        style={[
          { '--v-card-subtitle-opacity': props.opacity },
          props.style,
        ]}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CCardSubtitle = InstanceType<typeof CCardSubtitle>
