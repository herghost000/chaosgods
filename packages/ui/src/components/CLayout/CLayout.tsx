import './CLayout.sass'
import { Suspense } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { createLayout, makeLayoutProps } from '@/composables/layout'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCLayoutProps = propsFactory({
  ...makeComponentProps(),
  ...makeDimensionProps(),
  ...makeLayoutProps(),
}, 'CLayout')

export const CLayout = genericComponent()({
  name: 'CLayout',

  props: makeCLayoutProps(),

  setup(props, { slots }) {
    const { layoutClasses, layoutStyles, getLayoutItem, items, layoutRef } = createLayout(props)
    const { dimensionStyles } = useDimension(props)

    useRender(() => (
      <div
        ref={layoutRef}
        class={[
          layoutClasses.value,
          props.class,
        ]}
        style={[
          dimensionStyles.value,
          layoutStyles.value,
          props.style,
        ]}
      >
        <Suspense>
          <>
            { slots.default?.() }
          </>
        </Suspense>
      </div>
    ))

    return {
      getLayoutItem,
      items,
    }
  },
})

export type CLayout = InstanceType<typeof CLayout>
