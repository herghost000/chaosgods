import './CThemeProvider.sass'
import { makeComponentProps } from '@/composables/component'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genericComponent, propsFactory } from '@/util'

export const makeCThemeProviderProps = propsFactory({
  withBackground: Boolean,

  ...makeComponentProps(),
  ...makeThemeProps(),
  ...makeTagProps(),
}, 'CThemeProvider')

export const CThemeProvider = genericComponent()({
  name: 'CThemeProvider',

  props: makeCThemeProviderProps(),

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)

    return () => {
      if (!props.withBackground)
        return slots.default?.()

      return (
        <props.tag
          class={[
            'v-theme-provider',
            themeClasses.value,
            props.class,
          ]}
          style={props.style}
        >
          { slots.default?.() }
        </props.tag>
      )
    }
  },
})

export type CThemeProvider = InstanceType<typeof CThemeProvider>
