import { CBtn, makeCBtnProps } from '@/components/CBtn/CBtn'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CBtnSlots } from '@/components/CBtn/CBtn'

export const makeCAppBarNavIconProps = propsFactory({
  ...makeCBtnProps({
    icon: '$menu',
    variant: 'text' as const,
  }),
}, 'CAppBarNavIcon')

export const CAppBarNavIcon = genericComponent<CBtnSlots>()({
  name: 'CAppBarNavIcon',

  props: makeCAppBarNavIconProps(),

  setup(props, { slots }) {
    useRender(() => (
      <CBtn
        {...props}
        class={[
          'v-app-bar-nav-icon',
        ]}
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CAppBarNavIcon = InstanceType<typeof CAppBarNavIcon>
