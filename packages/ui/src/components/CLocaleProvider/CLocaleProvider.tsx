import './CLocaleProvider.sass'
import { makeComponentProps } from '@/composables/component'
import { provideLocale } from '@/composables/locale'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCLocaleProviderProps = propsFactory({
  locale: String,
  fallbackLocale: String,
  messages: Object,
  rtl: {
    type: Boolean,
    default: undefined,
  },

  ...makeComponentProps(),
}, 'CLocaleProvider')

export const CLocaleProvider = genericComponent()({
  name: 'CLocaleProvider',

  props: makeCLocaleProviderProps(),

  setup(props, { slots }) {
    const { rtlClasses } = provideLocale(props)

    useRender(() => (
      <div
        class={[
          'v-locale-provider',
          rtlClasses.value,
          props.class,
        ]}
        style={props.style}
      >
        { slots.default?.() }
      </div>
    ))

    return {}
  },
})

export type CLocaleProvider = InstanceType<typeof CLocaleProvider>
