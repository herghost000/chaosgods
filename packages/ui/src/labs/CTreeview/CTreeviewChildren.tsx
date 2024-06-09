import { shallowRef } from 'vue'
import type { PropType } from 'vue'
import { CTreeviewGroup } from './CTreeviewGroup'
import { CTreeviewItem } from './CTreeviewItem'
import { CCheckboxBtn } from '@/components/CCheckbox'
import { genericComponent, propsFactory } from '@/util'
import type { InternalListItem } from '@/components/CList/CList'
import type { CListItemSlots } from '@/components/CList/CListItem'
import type { GenericProps } from '@/util'

export type CTreeviewChildrenSlots<T> = {
  [K in keyof Omit<CListItemSlots, 'default'>]: CListItemSlots[K] & { item: T }
} & {
  default: never
  item: { props: InternalListItem['props'] }
}

export const makeCTreeviewChildrenProps = propsFactory({
  loadChildren: Function as PropType<(item: unknown) => Promise<void>>,
  loadingIcon: {
    type: String,
    default: '$loading',
  },
  items: Array as PropType<readonly InternalListItem[]>,
  selectable: Boolean,
}, 'CTreeviewChildren')

export const CTreeviewChildren = genericComponent<new<T extends InternalListItem>(
  props: {
    items?: readonly T[]
  },
  slots: CTreeviewChildrenSlots<T>
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CTreeviewChildren',

  props: makeCTreeviewChildrenProps(),

  setup(props, { slots }) {
    const isLoading = shallowRef(null)

    function checkChildren(item: any) {
      return new Promise<void>((resolve) => {
        if (!props.items?.length || !props.loadChildren)
          return resolve()

        if (item?.children?.length === 0) {
          isLoading.value = item.value
          props.loadChildren(item).then(resolve)

          return
        }

        resolve()
      }).finally(() => {
        isLoading.value = null
      })
    }

    function onClick(e: MouseEvent | KeyboardEvent, item: any) {
      e.stopPropagation()

      checkChildren(item)
    }

    return () => slots.default?.() ?? props.items?.map(({ children, props: itemProps, raw: item }) => {
      const loading = isLoading.value === item.value
      const slotsWithItem = {
        prepend: slots.prepend
          ? slotProps => slots.prepend?.({ ...slotProps, item })
          : props.selectable
            ? ({ isSelected, isIndeterminate }) => (
              <CCheckboxBtn
                key={item.value}
                tabindex="-1"
                modelValue={isSelected}
                loading={loading}
                indeterminate={isIndeterminate}
                onClick={(e: MouseEvent) => onClick(e, item)}
              />
              )
            : undefined,
        append: slots.append ? slotProps => slots.append?.({ ...slotProps, item }) : undefined,
        title: slots.title ? slotProps => slots.title?.({ ...slotProps, item }) : undefined,
      } satisfies CTreeviewItem['$props']['$children']

      const treeviewGroupProps = CTreeviewGroup.filterProps(itemProps)
      const treeviewChildrenProps = CTreeviewChildren.filterProps(props)

      return children
        ? (
          <CTreeviewGroup
            value={itemProps?.value}
            {...treeviewGroupProps}
          >
            {{
              activator: ({ props: activatorProps }) => (
                <CTreeviewItem
                  {...itemProps}
                  {...activatorProps}
                  loading={loading}
                  v-slots={slotsWithItem}
                  onClick={(e: MouseEvent | KeyboardEvent) => onClick(e, item)}
                />
              ),
              default: () => (
                <CTreeviewChildren
                  {...treeviewChildrenProps}
                  items={children}
                  v-slots={slots}
                />
              ),
            }}
          </CTreeviewGroup>
          )
        : (
            slots.item?.({ props: itemProps }) ?? (
              <CTreeviewItem
                {...itemProps}
                v-slots={slotsWithItem}
              />
            ))
    })
  },
})
