import './CApp.sass'
import { Suspense } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { createLayout, makeLayoutProps } from '@/composables/layout'
import { useRtl } from '@/composables/locale'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCAppProps = propsFactory({
  ...makeComponentProps(),
  ...makeLayoutProps({ fullHeight: true }),
  ...makeThemeProps(),
}, 'CApp')

export const CApp = genericComponent()({
  name: 'CApp',

  props: makeCAppProps(),

  setup(props, { slots }) {
    const theme = provideTheme(props)
    const { layoutClasses, getLayoutItem, items, layoutRef } = createLayout(props)
    const { rtlClasses } = useRtl()

    useRender(() => (
      <div
        ref={layoutRef}
        class={[
          'v-application',
          theme.themeClasses.value,
          layoutClasses.value,
          rtlClasses.value,
          props.class,
        ]}
        style={[
          props.style,
        ]}
      >
        <div class="v-application__wrap">
          <Suspense>
            <>
              { slots.default?.() }
            </>
          </Suspense>
        </div>
      </div>
    ))

    return {
      getLayoutItem,
      items,
      theme,
    }
  },
})

export type CApp = InstanceType<typeof CApp>
