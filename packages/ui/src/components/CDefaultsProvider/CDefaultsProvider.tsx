import { toRefs } from 'vue'
import type { PropType } from 'vue'
import { provideDefaults } from '@/composables/defaults'
import { genericComponent, propsFactory } from '@/util'
import type { DefaultsOptions } from '@/composables/defaults'

export const makeCDefaultsProviderProps = propsFactory({
  defaults: Object as PropType<DefaultsOptions>,
  disabled: Boolean,
  reset: [Number, String],
  root: [Boolean, String],
  scoped: Boolean,
}, 'CDefaultsProvider')

export const CDefaultsProvider = genericComponent(false)({
  name: 'CDefaultsProvider',

  props: makeCDefaultsProviderProps(),

  setup(props, { slots }) {
    const { defaults, disabled, reset, root, scoped } = toRefs(props)

    provideDefaults(defaults, {
      reset,
      root,
      scoped,
      disabled,
    })

    return () => slots.default?.()
  },
})

export type CDefaultsProvider = InstanceType<typeof CDefaultsProvider>
