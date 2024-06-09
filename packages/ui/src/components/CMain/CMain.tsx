import './CMain.sass'
import { makeComponentProps } from '@/composables/component'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { useLayout } from '@/composables/layout'
import { useSsrBoot } from '@/composables/ssrBoot'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCMainProps = propsFactory({
  scrollable: Boolean,

  ...makeComponentProps(),
  ...makeDimensionProps(),
  ...makeTagProps({ tag: 'main' }),
}, 'CMain')

export const CMain = genericComponent()({
  name: 'CMain',

  props: makeCMainProps(),

  setup(props, { slots }) {
    const { dimensionStyles } = useDimension(props)
    const { mainStyles, layoutIsReady } = useLayout()
    const { ssrBootStyles } = useSsrBoot()

    useRender(() => (
      <props.tag
        class={[
          'v-main',
          { 'v-main--scrollable': props.scrollable },
          props.class,
        ]}
        style={[
          mainStyles.value,
          ssrBootStyles.value,
          dimensionStyles.value,
          props.style,
        ]}
      >
        { props.scrollable
          ? (
            <div class="v-main__scroller">
              { slots.default?.() }
            </div>
            )
          : slots.default?.()}
      </props.tag>
    ))

    return layoutIsReady
  },
})

export type CMain = InstanceType<typeof CMain>
