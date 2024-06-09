import { CToolbarTitle, makeCToolbarTitleProps } from '@/components/CToolbar/CToolbarTitle'
import { genericComponent, useRender } from '@/util'
import type { CToolbarTitleSlots } from '@/components/CToolbar/CToolbarTitle'

export const CAppBarTitle = genericComponent<CToolbarTitleSlots>()({
  name: 'CAppBarTitle',

  props: makeCToolbarTitleProps(),

  setup(props, { slots }) {
    useRender(() => (
      <CToolbarTitle
        {...props}
        class="v-app-bar-title"
        v-slots={slots}
      />
    ))

    return {}
  },
})

export type CAppBarTitle = InstanceType<typeof CAppBarTitle>
