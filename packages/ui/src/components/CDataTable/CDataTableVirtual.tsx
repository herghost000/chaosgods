import { computed, shallowRef, toRef } from 'vue'
import { makeDataTableProps } from './CDataTable'
import { CDataTableHeaders } from './CDataTableHeaders'
import { CDataTableRow } from './CDataTableRow'
import { CDataTableRows } from './CDataTableRows'
import { provideExpanded } from './composables/expand'
import { createGroupBy, makeDataTableGroupProps, provideGroupBy, useGroupedItems } from './composables/group'
import { createHeaders } from './composables/headers'
import { useDataTableItems } from './composables/items'
import { useOptions } from './composables/options'
import { provideSelection } from './composables/select'
import { createSort, provideSort, useSortedItems } from './composables/sort'
import type { CDataTableSlotProps } from './CDataTable'
import type { CDataTableHeadersSlots } from './CDataTableHeaders'
import type { CDataTableRowsSlots } from './CDataTableRows'
import { provideDefaults } from '@/composables/defaults'
import { makeFilterProps, useFilter } from '@/composables/filter'
import { makeVirtualProps, useVirtual } from '@/composables/virtual'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'
import { CVirtualScrollItem } from '@/components/CVirtualScroll/CVirtualScrollItem'
import { CTable } from '@/components/CTable'
import type { CellProps, RowProps } from '@/components/CDataTable/types'
import type { GenericProps, SelectItemKey, TemplateRef } from '@/util'

type CDataTableVirtualSlotProps<T> = Omit<
  CDataTableSlotProps<T>,
  | 'setItemsPerPage'
  | 'page'
  | 'pageCount'
  | 'itemsPerPage'
>

export type CDataTableVirtualSlots<T> = CDataTableRowsSlots<T> & CDataTableHeadersSlots & {
  'colgroup': CDataTableVirtualSlotProps<T>
  'top': CDataTableVirtualSlotProps<T>
  'headers': CDataTableHeadersSlots['headers']
  'bottom': CDataTableVirtualSlotProps<T>
  'body.prepend': CDataTableVirtualSlotProps<T>
  'body.append': CDataTableVirtualSlotProps<T>
  'item': {
    itemRef: TemplateRef
  }
}

export const makeVDataTableVirtualProps = propsFactory({
  ...makeDataTableProps(),
  ...makeDataTableGroupProps(),
  ...makeVirtualProps(),
  ...makeFilterProps(),
}, 'CDataTableVirtual')

type ItemType<T> = T extends readonly (infer U)[] ? U : never

export const CDataTableVirtual = genericComponent<new<T extends readonly any[], V>(
  props: {
    'items'?: T
    'itemValue'?: SelectItemKey<ItemType<T>>
    'rowProps'?: RowProps<ItemType<T>>
    'cellProps'?: CellProps<ItemType<T>>
    'itemSelectable'?: SelectItemKey<ItemType<T>>
    'modelValue'?: V
    'onUpdate:modelValue'?: (value: V) => void
  },
  slots: CDataTableVirtualSlots<ItemType<T>>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataTableVirtual',

  props: makeVDataTableVirtualProps(),

  emits: {
    'update:modelValue': (_value: any[]) => {},
    'update:sortBy': (_value: any) => true,
    'update:options': (_value: any) => true,
    'update:groupBy': (_value: any) => true,
    'update:expanded': (_value: any) => true,
  },

  setup(props, { attrs, slots }) {
    const { groupBy } = createGroupBy(props)
    const { sortBy, multiSort, mustSort } = createSort(props)

    const {
      columns,
      headers,
      filterFunctions,
      sortFunctions,
      sortRawFunctions,
    } = createHeaders(props, {
      groupBy,
      showSelect: toRef(props, 'showSelect'),
      showExpand: toRef(props, 'showExpand'),
    })
    const { items } = useDataTableItems(props, columns)

    const search = toRef(props, 'search')
    const { filteredItems } = useFilter(props, items, search, {
      transform: item => item.columns,
      customKeyFilter: filterFunctions,
    })

    const { toggleSort } = provideSort({ sortBy, multiSort, mustSort })
    const { sortByWithGroups, opened, extractRows, isGroupOpen, toggleGroup } = provideGroupBy({ groupBy, sortBy })

    const { sortedItems } = useSortedItems(props, filteredItems, sortByWithGroups, {
      transform: item => item.columns,
      sortFunctions,
      sortRawFunctions,
    })
    const { flatItems } = useGroupedItems(sortedItems, groupBy, opened)

    const allItems = computed(() => extractRows(flatItems.value))

    const { isSelected, select, selectAll, toggleSelect, someSelected, allSelected } = provideSelection(props, {
      allItems,
      currentPage: allItems,
    })
    const { isExpanded, toggleExpand } = provideExpanded(props)

    const {
      containerRef,
      markerRef,
      paddingTop,
      paddingBottom,
      computedItems,
      handleItemResize,
      handleScroll,
      handleScrollend,
    } = useVirtual(props, flatItems)
    const displayItems = computed(() => computedItems.value.map(item => item.raw))

    useOptions({
      sortBy,
      page: shallowRef(1),
      itemsPerPage: shallowRef(-1),
      groupBy,
      search,
    })

    provideDefaults({
      CDataTableRows: {
        hideNoData: toRef(props, 'hideNoData'),
        noDataText: toRef(props, 'noDataText'),
        loading: toRef(props, 'loading'),
        loadingText: toRef(props, 'loadingText'),
      },
    })

    const slotProps = computed<CDataTableVirtualSlotProps<any>>(() => ({
      sortBy: sortBy.value,
      toggleSort,
      someSelected: someSelected.value,
      allSelected: allSelected.value,
      isSelected,
      select,
      selectAll,
      toggleSelect,
      isExpanded,
      toggleExpand,
      isGroupOpen,
      toggleGroup,
      items: allItems.value.map(item => item.raw),
      internalItems: allItems.value,
      groupedItems: flatItems.value,
      columns: columns.value,
      headers: headers.value,
    }))

    useRender(() => {
      const dataTableHeadersProps = CDataTableHeaders.filterProps(props)
      const dataTableRowsProps = CDataTableRows.filterProps(props)
      const tableProps = CTable.filterProps(props)

      return (
        <CTable
          class={[
            'v-data-table',
            {
              'v-data-table--loading': props.loading,
            },
            props.class,
          ]}
          style={props.style}
          {...tableProps}
        >
          {{
            top: () => slots.top?.(slotProps.value),
            wrapper: () => (
              <div
                ref={containerRef}
                onScrollPassive={handleScroll}
                onScrollend={handleScrollend}
                class="v-table__wrapper"
                style={{
                  height: convertToUnit(props.height),
                }}
              >
                <table>
                  { slots.colgroup?.(slotProps.value) }
                  { !props.hideDefaultHeader && (
                    <thead key="thead">
                      <CDataTableHeaders
                        {...dataTableHeadersProps}
                        sticky={props.fixedHeader}
                        v-slots={slots}
                      />
                    </thead>
                  )}
                  <tbody>
                    <tr ref={markerRef} style={{ height: convertToUnit(paddingTop.value), border: 0 }}>
                      <td colspan={columns.value.length} style={{ height: 0, border: 0 }}></td>
                    </tr>

                    { slots['body.prepend']?.(slotProps.value) }

                    <CDataTableRows
                      {...attrs}
                      {...dataTableRowsProps}
                      items={displayItems.value}
                    >
                      {{
                        ...slots,
                        item: itemSlotProps => (
                          <CVirtualScrollItem
                            key={itemSlotProps.internalItem.index}
                            renderless
                            onUpdate:height={height => handleItemResize(itemSlotProps.internalItem.index, height)}
                          >
                            { ({ itemRef }) => (
                              slots.item?.({ ...itemSlotProps, itemRef }) ?? (
                                <CDataTableRow
                                  {...itemSlotProps.props}
                                  ref={itemRef}
                                  key={itemSlotProps.internalItem.index}
                                  index={itemSlotProps.internalItem.index}
                                  v-slots={slots}
                                />
                              )
                            )}
                          </CVirtualScrollItem>
                        ),
                      }}
                    </CDataTableRows>

                    { slots['body.append']?.(slotProps.value) }

                    <tr style={{ height: convertToUnit(paddingBottom.value), border: 0 }}>
                      <td colspan={columns.value.length} style={{ height: 0, border: 0 }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
            bottom: () => slots.bottom?.(slotProps.value),
          }}
        </CTable>
      )
    })
  },
})

export type CDataTableVirtual = InstanceType<typeof CDataTableVirtual>
