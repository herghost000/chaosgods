import './CResponsive.sass'
import { computed } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { genericComponent, propsFactory, useRender } from '@/util'

export type CResponsiveSlots = {
  default: never
  additional: never
}

export function useAspectStyles(props: { aspectRatio?: string | number }) {
  return {
    aspectStyles: computed(() => {
      const ratio = Number(props.aspectRatio)

      return ratio
        ? { paddingBottom: `${String(1 / ratio * 100)}%` }
        : undefined
    }),
  }
}

export const makeCResponsiveProps = propsFactory({
  aspectRatio: [String, Number],
  contentClass: null,
  inline: Boolean,

  ...makeComponentProps(),
  ...makeDimensionProps(),
}, 'CResponsive')

export const CResponsive = genericComponent<CResponsiveSlots>()({
  name: 'CResponsive',

  props: makeCResponsiveProps(),

  setup(props, { slots }) {
    const { aspectStyles } = useAspectStyles(props)
    const { dimensionStyles } = useDimension(props)

    useRender(() => (
      <div
        class={[
          'v-responsive',
          { 'v-responsive--inline': props.inline },
          props.class,
        ]}
        style={[
          dimensionStyles.value,
          props.style,
        ]}
      >
        <div class="v-responsive__sizer" style={aspectStyles.value} />

        { slots.additional?.() }

        { slots.default && (
          <div class={['v-responsive__content', props.contentClass]}>{ slots.default() }</div>
        )}
      </div>
    ))

    return {}
  },
})

export type CResponsive = InstanceType<typeof CResponsive>
