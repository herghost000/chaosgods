import { Fragment, mergeProps } from 'vue'
import type { PropType } from 'vue'
import { CDataTableGroupHeaderRow } from './CDataTableGroupHeaderRow'
import { CDataTableRow } from './CDataTableRow'
import { useExpanded } from './composables/expand'
import { useGroupBy } from './composables/group'
import { useHeaders } from './composables/headers'
import { useSelection } from './composables/select'
import type { Group } from './composables/group'
import type { CellProps, DataTableItem, GroupHeaderSlot, ItemSlot, RowProps } from './types'
import type { CDataTableGroupHeaderRowSlots } from './CDataTableGroupHeaderRow'
import type { CDataTableRowSlots } from './CDataTableRow'
import { genericComponent, getPrefixedEventHandlers, propsFactory, useRender } from '@/util'
import { useLocale } from '@/composables/locale'
import { makeDisplayProps, useDisplay } from '@/composables/display'
import type { GenericProps } from '@/util'

export type CDataTableRowsSlots<T> = CDataTableGroupHeaderRowSlots & CDataTableRowSlots<T> & {
  'item': ItemSlot<T> & { props: Record<string, any> }
  'loading': never
  'group-header': GroupHeaderSlot
  'no-data': never
  'expanded-row': ItemSlot<T>
}

export const makeCDataTableRowsProps = propsFactory({
  loading: [Boolean, String],
  loadingText: {
    type: String,
    default: '$chaos.dataIterator.loadingText',
  },
  hideNoData: Boolean,
  items: {
    type: Array as PropType<readonly (DataTableItem | Group)[]>,
    default: () => ([]),
  },
  noDataText: {
    type: String,
    default: '$chaos.noDataText',
  },
  rowProps: [Object, Function] as PropType<RowProps<any>>,
  cellProps: [Object, Function] as PropType<CellProps<any>>,

  ...makeDisplayProps(),
}, 'CDataTableRows')

export const CDataTableRows = genericComponent<new<T>(
  props: {
    items?: readonly (DataTableItem<T> | Group<T>)[]
  },
  slots: CDataTableRowsSlots<T>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataTableRows',

  inheritAttrs: false,

  props: makeCDataTableRowsProps(),

  setup(props, { attrs, slots }) {
    const { columns } = useHeaders()
    const { expandOnClick, toggleExpand, isExpanded } = useExpanded()
    const { isSelected, toggleSelect } = useSelection()
    const { toggleGroup, isGroupOpen } = useGroupBy()
    const { t } = useLocale()
    const { mobile } = useDisplay(props)

    useRender(() => {
      if (props.loading && (!props.items.length || slots.loading)) {
        return (
          <tr
            class="v-data-table-rows-loading"
            key="loading"
          >
            <td colspan={columns.value.length}>
              { slots.loading?.() ?? t(props.loadingText) }
            </td>
          </tr>
        )
      }

      if (!props.loading && !props.items.length && !props.hideNoData) {
        return (
          <tr
            class="v-data-table-rows-no-data"
            key="no-data"
          >
            <td colspan={columns.value.length}>
              { slots['no-data']?.() ?? t(props.noDataText) }
            </td>
          </tr>
        )
      }

      return (
        <>
          { props.items.map((item, index) => {
            if (item.type === 'group') {
              const slotProps = {
                index,
                item,
                columns: columns.value,
                isExpanded,
                toggleExpand,
                isSelected,
                toggleSelect,
                toggleGroup,
                isGroupOpen,
              } satisfies GroupHeaderSlot

              return slots['group-header']
                ? slots['group-header'](slotProps)
                : (
                  <CDataTableGroupHeaderRow
                    key={`group-header_${item.id}`}
                    item={item}
                    {...getPrefixedEventHandlers(attrs, ':group-header', () => slotProps)}
                    v-slots={slots}
                  />
                  )
            }

            const slotProps = {
              index,
              item: item.raw,
              internalItem: item,
              columns: columns.value,
              isExpanded,
              toggleExpand,
              isSelected,
              toggleSelect,
            } satisfies ItemSlot<any>

            const itemSlotProps = {
              ...slotProps,
              props: mergeProps(
                {
                  key: `item_${item.key ?? item.index}`,
                  onClick: expandOnClick.value
                    ? () => {
                        toggleExpand(item)
                      }
                    : undefined,
                  index,
                  item,
                  cellProps: props.cellProps,
                  mobile: mobile.value,
                },
                getPrefixedEventHandlers(attrs, ':row', () => slotProps),
                typeof props.rowProps === 'function'
                  ? props.rowProps({
                    item: slotProps.item,
                    index: slotProps.index,
                    internalItem: slotProps.internalItem,
                  })
                  : props.rowProps,
              ),
            }

            return (
              <Fragment key={itemSlotProps.props.key as string}>
                { slots.item
                  ? slots.item(itemSlotProps)
                  : (
                    <CDataTableRow
                      {...itemSlotProps.props}
                      v-slots={slots}
                    />
                    )}

                { isExpanded(item) && slots['expanded-row']?.(slotProps) }
              </Fragment>
            )
          })}
        </>
      )
    })

    return {}
  },
})

export type CDataTableRows = InstanceType<typeof CDataTableRows>
