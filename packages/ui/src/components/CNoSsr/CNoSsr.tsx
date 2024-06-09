import { useHydration } from '@/composables/hydration'
import { defineComponent } from '@/util'

export const CNoSsr = defineComponent({
  name: 'CNoSsr',

  setup(_, { slots }) {
    const show = useHydration()

    return () => show.value && slots.default?.()
  },
})

export type CNoSsr = InstanceType<typeof CNoSsr>
