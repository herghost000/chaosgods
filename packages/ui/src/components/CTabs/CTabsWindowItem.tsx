import { CWindowItem, makeCWindowItemProps } from '@/components/CWindow/CWindowItem'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCTabsWindowItemProps = propsFactory({
  ...makeCWindowItemProps(),
}, 'CTabsWindowItem')

export const CTabsWindowItem = genericComponent()({
  name: 'CTabsWindowItem',

  props: makeCTabsWindowItemProps(),

  setup(props, { slots }) {
    useRender(() => {
      const windowItemProps = CWindowItem.filterProps(props)

      return (
        <CWindowItem
          _as="CTabsWindowItem"
          {...windowItemProps}
          class={[
            'v-tabs-window-item',
            props.class,
          ]}
          style={props.style}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CTabsWindowItem = InstanceType<typeof CTabsWindowItem>
