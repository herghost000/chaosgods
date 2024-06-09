import { toDisplayString, withModifiers } from 'vue'
import type { PropType } from 'vue'
import { CDataTableColumn } from './CDataTableColumn'
import { useExpanded } from './composables/expand'
import { useHeaders } from './composables/headers'
import { useSelection } from './composables/select'
import { useSort } from './composables/sort'
import type { CellProps, DataTableItem, ItemKeySlot } from './types'
import type { CDataTableHeaderCellColumnSlotProps } from './CDataTableHeaders'
import { makeDisplayProps, useDisplay } from '@/composables/display'
import { EventProp, genericComponent, getObjectValueByPath, propsFactory, useRender } from '@/util'
import { CCheckboxBtn } from '@/components/CCheckbox'
import { CBtn } from '@/components/CBtn'
import type { GenericProps } from '@/util'

export type CDataTableRowSlots<T> = {
  'item.data-table-select': Omit<ItemKeySlot<T>, 'value'>
  'item.data-table-expand': Omit<ItemKeySlot<T>, 'value'>
  'header.data-table-select': CDataTableHeaderCellColumnSlotProps
  'header.data-table-expand': CDataTableHeaderCellColumnSlotProps
} & {
  [key: `item.${string}`]: ItemKeySlot<T>
  [key: `header.${string}`]: CDataTableHeaderCellColumnSlotProps
}

export const makeCDataTableRowProps = propsFactory({
  index: Number,
  item: Object as PropType<DataTableItem>,
  cellProps: [Object, Function] as PropType<CellProps<any>>,
  onClick: EventProp<[MouseEvent]>(),
  onContextmenu: EventProp<[MouseEvent]>(),
  onDblclick: EventProp<[MouseEvent]>(),

  ...makeDisplayProps(),
}, 'CDataTableRow')

export const CDataTableRow = genericComponent<new<T>(
  props: {
    item?: DataTableItem<T>
    cellProps?: CellProps<T>
  },
  slots: CDataTableRowSlots<T>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataTableRow',

  props: makeCDataTableRowProps(),

  setup(props, { slots }) {
    const { displayClasses, mobile } = useDisplay(props, 'v-data-table__tr')
    const { isSelected, toggleSelect, someSelected, allSelected, selectAll } = useSelection()
    const { isExpanded, toggleExpand } = useExpanded()
    const { toggleSort, sortBy, isSorted } = useSort()
    const { columns } = useHeaders()

    useRender(() => (
      <tr
        class={[
          'v-data-table__tr',
          {
            'v-data-table__tr--clickable': !!(props.onClick || props.onContextmenu || props.onDblclick),
          },
          displayClasses.value,
        ]}
        onClick={props.onClick as any}
        onContextmenu={props.onContextmenu as any}
        onDblclick={props.onDblclick as any}
      >
        { props.item && columns.value.map((column, _i) => {
          const item = props.item!
          const slotName = `item.${column.key}` as const
          const headerSlotName = `header.${column.key}` as const
          const slotProps = {
            index: props.index!,
            item: item.raw,
            internalItem: item,
            value: getObjectValueByPath(item.columns, column.key),
            column,
            isSelected,
            toggleSelect,
            isExpanded,
            toggleExpand,
          } satisfies ItemKeySlot<any>

          const columnSlotProps: CDataTableHeaderCellColumnSlotProps = {
            column,
            selectAll,
            isSorted,
            toggleSort,
            sortBy: sortBy.value,
            someSelected: someSelected.value,
            allSelected: allSelected.value,
            getSortIcon: () => '',
          }

          const cellProps = typeof props.cellProps === 'function'
            ? props.cellProps({
              index: slotProps.index,
              item: slotProps.item,
              internalItem: slotProps.internalItem,
              value: slotProps.value,
              column,
            })
            : props.cellProps
          const columnCellProps = typeof column.cellProps === 'function'
            ? column.cellProps({
              index: slotProps.index,
              item: slotProps.item,
              internalItem: slotProps.internalItem,
              value: slotProps.value,
            })
            : column.cellProps

          return (
            <CDataTableColumn
              align={column.align}
              class={{
                'v-data-table__td--expanded-row': column.key === 'data-table-expand',
                'v-data-table__td--select-row': column.key === 'data-table-select',
              }}
              fixed={column.fixed}
              fixedOffset={column.fixedOffset}
              lastFixed={column.lastFixed}
              maxWidth={!mobile.value ? column.maxWidth : undefined}
              noPadding={column.key === 'data-table-select' || column.key === 'data-table-expand'}
              nowrap={column.nowrap}
              width={!mobile.value ? column.width : undefined}
              {...cellProps}
              {...columnCellProps}
            >
              {{
                default: () => {
                  if (slots[slotName] && !mobile.value)
                    return slots[slotName]?.(slotProps)

                  if (column.key === 'data-table-select') {
                    return slots['item.data-table-select']?.(slotProps) ?? (
                      <CCheckboxBtn
                        disabled={!item.selectable}
                        modelValue={isSelected([item])}
                        onClick={withModifiers(() => toggleSelect(item), ['stop'])}
                      />
                    )
                  }

                  if (column.key === 'data-table-expand') {
                    return slots['item.data-table-expand']?.(slotProps) ?? (
                      <CBtn
                        icon={isExpanded(item) ? '$collapse' : '$expand'}
                        size="small"
                        variant="text"
                        onClick={withModifiers(() => toggleExpand(item), ['stop'])}
                      />
                    )
                  }

                  const displayValue = toDisplayString(slotProps.value)

                  return !mobile.value
                    ? displayValue
                    : (
                      <>
                        <div class="v-data-table__td-title">
                          { slots[headerSlotName]?.(columnSlotProps) ?? column.title }
                        </div>

                        <div class="v-data-table__td-value">
                          { slots[slotName]?.(slotProps) ?? displayValue }
                        </div>
                      </>
                      )
                },
              }}
            </CDataTableColumn>
          )
        })}
      </tr>
    ))
  },
})

export type CDataTableRow = InstanceType<typeof CDataTableRow>
