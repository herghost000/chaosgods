import type { PropType } from 'vue'
import { CDivider } from '../CDivider'
import { CListGroup } from './CListGroup'
import { CListItem } from './CListItem'
import { CListSubheader } from './CListSubheader'
import { createList } from './list'
import type { InternalListItem } from './CList'
import type { CListItemSlots } from './CListItem'
import { genericComponent, propsFactory } from '@/util'
import type { GenericProps } from '@/util'

export type CListChildrenSlots<T> = {
  [K in keyof Omit<CListItemSlots, 'default'>]: CListItemSlots[K] & { item: T }
} & {
  default: never
  item: { props: InternalListItem['props'] }
  divider: { props: InternalListItem['props'] }
  subheader: { props: InternalListItem['props'] }
  header: { props: InternalListItem['props'] }
}

export const makeCListChildrenProps = propsFactory({
  items: Array as PropType<readonly InternalListItem[]>,
  returnObject: Boolean,
}, 'CListChildren')

export const CListChildren = genericComponent<new<T extends InternalListItem>(
  props: {
    items?: readonly T[]
    returnObject?: boolean
  },
  slots: CListChildrenSlots<T>
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CListChildren',

  props: makeCListChildrenProps(),

  setup(props, { slots }) {
    createList()

    return () => slots.default?.() ?? props.items?.map(({ children, props: itemProps, type, raw: item }) => {
      if (type === 'divider') {
        return slots.divider?.({ props: itemProps }) ?? (
          <CDivider {...itemProps} />
        )
      }

      if (type === 'subheader') {
        return slots.subheader?.({ props: itemProps }) ?? (
          <CListSubheader {...itemProps} />
        )
      }

      const slotsWithItem = {
        subtitle: slots.subtitle ? (slotProps: any) => slots.subtitle?.({ ...slotProps, item }) : undefined,
        prepend: slots.prepend ? (slotProps: any) => slots.prepend?.({ ...slotProps, item }) : undefined,
        append: slots.append ? (slotProps: any) => slots.append?.({ ...slotProps, item }) : undefined,
        title: slots.title ? (slotProps: any) => slots.title?.({ ...slotProps, item }) : undefined,
      }

      const listGroupProps = CListGroup.filterProps(itemProps)

      return children
        ? (
          <CListGroup
            value={itemProps?.value}
            {...listGroupProps}
          >
            {{
              activator: ({ props: activatorProps }) => {
                const listItemProps = {
                  ...itemProps,
                  ...activatorProps,
                  value: props.returnObject ? item : itemProps.value,
                }

                return slots.header
                  ? slots.header({ props: listItemProps })
                  : (
                    <CListItem {...listItemProps} v-slots={slotsWithItem} />
                    )
              },
              default: () => (
                <CListChildren items={children} v-slots={slots} />
              ),
            }}
          </CListGroup>
          )
        : (
            slots.item
              ? slots.item({ props: itemProps })
              : (
                <CListItem
                  {...itemProps}
                  value={props.returnObject ? item : itemProps.value}
                  v-slots={slotsWithItem}
                />
                )
          )
    })
  },
})
