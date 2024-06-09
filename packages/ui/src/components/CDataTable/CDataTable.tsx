import './CDataTable.sass'
import { computed, toRef } from 'vue'
import type { DeepReadonly, UnwrapRef } from 'vue'
import { CDataTableFooter, makeCDataTableFooterProps } from './CDataTableFooter'
import { CDataTableHeaders, makeCDataTableHeadersProps } from './CDataTableHeaders'
import { CDataTableRows, makeCDataTableRowsProps } from './CDataTableRows'
import { makeDataTableExpandProps, provideExpanded } from './composables/expand'
import { createGroupBy, makeDataTableGroupProps, provideGroupBy, useGroupedItems } from './composables/group'
import { createHeaders, makeDataTableHeaderProps } from './composables/headers'
import { makeDataTableItemsProps, useDataTableItems } from './composables/items'
import { useOptions } from './composables/options'
import { createPagination, makeDataTablePaginateProps, providePagination, usePaginatedItems } from './composables/paginate'
import { makeDataTableSelectProps, provideSelection } from './composables/select'
import { createSort, makeDataTableSortProps, provideSort, useSortedItems } from './composables/sort'
import type { Group } from './composables/group'
import type { CellProps, DataTableHeader, DataTableItem, InternalDataTableHeader, RowProps } from './types'
import type { CDataTableHeadersSlots } from './CDataTableHeaders'
import type { CDataTableRowsSlots } from './CDataTableRows'
import { genericComponent, propsFactory, useRender } from '@/util'
import { makeFilterProps, useFilter } from '@/composables/filter'
import { provideDefaults } from '@/composables/defaults'
import { CTable, makeCTableProps } from '@/components/CTable/CTable'
import { CDivider } from '@/components/CDivider'
import type { GenericProps, SelectItemKey } from '@/util'

export type CDataTableSlotProps<T> = {
  page: number
  itemsPerPage: number
  sortBy: UnwrapRef<ReturnType<typeof provideSort>['sortBy']>
  pageCount: number
  toggleSort: ReturnType<typeof provideSort>['toggleSort']
  setItemsPerPage: ReturnType<typeof providePagination>['setItemsPerPage']
  someSelected: boolean
  allSelected: boolean
  isSelected: ReturnType<typeof provideSelection>['isSelected']
  select: ReturnType<typeof provideSelection>['select']
  selectAll: ReturnType<typeof provideSelection>['selectAll']
  toggleSelect: ReturnType<typeof provideSelection>['toggleSelect']
  isExpanded: ReturnType<typeof provideExpanded>['isExpanded']
  toggleExpand: ReturnType<typeof provideExpanded>['toggleExpand']
  isGroupOpen: ReturnType<typeof provideGroupBy>['isGroupOpen']
  toggleGroup: ReturnType<typeof provideGroupBy>['toggleGroup']
  items: readonly T[]
  internalItems: readonly DataTableItem[]
  groupedItems: readonly (DataTableItem<T> | Group<DataTableItem<T>>)[]
  columns: InternalDataTableHeader[]
  headers: InternalDataTableHeader[][]
}

export type CDataTableSlots<T> = CDataTableRowsSlots<T> & CDataTableHeadersSlots & {
  'default': CDataTableSlotProps<T>
  'colgroup': CDataTableSlotProps<T>
  'top': CDataTableSlotProps<T>
  'body': CDataTableSlotProps<T>
  'tbody': CDataTableSlotProps<T>
  'thead': CDataTableSlotProps<T>
  'tfoot': CDataTableSlotProps<T>
  'bottom': CDataTableSlotProps<T>
  'body.prepend': CDataTableSlotProps<T>
  'body.append': CDataTableSlotProps<T>
  'footer.prepend': never
}

export const makeDataTableProps = propsFactory({
  ...makeCDataTableRowsProps(),

  hideDefaultFooter: Boolean,
  hideDefaultHeader: Boolean,
  width: [String, Number],
  search: String,

  ...makeDataTableExpandProps(),
  ...makeDataTableGroupProps(),
  ...makeDataTableHeaderProps(),
  ...makeDataTableItemsProps(),
  ...makeDataTableSelectProps(),
  ...makeDataTableSortProps(),
  ...makeCDataTableHeadersProps(),
  ...makeCTableProps(),
}, 'DataTable')

export const makeCDataTableProps = propsFactory({
  ...makeDataTablePaginateProps(),
  ...makeDataTableProps(),
  ...makeFilterProps(),
  ...makeCDataTableFooterProps(),
}, 'CDataTable')

type ItemType<T> = T extends readonly (infer U)[] ? U : never

export const CDataTable = genericComponent<new<T extends readonly any[], V>(
  props: {
    'items'?: T
    'itemValue'?: SelectItemKey<ItemType<T>>
    'rowProps'?: RowProps<ItemType<T>>
    'cellProps'?: CellProps<ItemType<T>>
    'itemSelectable'?: SelectItemKey<ItemType<T>>
    'headers'?: DeepReadonly<DataTableHeader<ItemType<T>>[]>
    'modelValue'?: V
    'onUpdate:modelValue'?: (value: V) => void
  },
  slots: CDataTableSlots<ItemType<T>>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataTable',

  props: makeCDataTableProps(),

  emits: {
    'update:modelValue': (_value: any[]) => true,
    'update:page': (_value: number) => true,
    'update:itemsPerPage': (_value: number) => true,
    'update:sortBy': (_value: any) => true,
    'update:options': (_value: any) => true,
    'update:groupBy': (_value: any) => true,
    'update:expanded': (_value: any) => true,
    'update:currentItems': (_value: any) => true,
  },

  setup(props, { attrs, slots }) {
    const { groupBy } = createGroupBy(props)
    const { sortBy, multiSort, mustSort } = createSort(props)
    const { page, itemsPerPage } = createPagination(props)

    const {
      columns,
      headers,
      sortFunctions,
      sortRawFunctions,
      filterFunctions,
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

    const { toggleSort } = provideSort({ sortBy, multiSort, mustSort, page })
    const { sortByWithGroups, opened, extractRows, isGroupOpen, toggleGroup } = provideGroupBy({ groupBy, sortBy })

    const { sortedItems } = useSortedItems(props, filteredItems, sortByWithGroups, {
      transform: item => item.columns,
      sortFunctions,
      sortRawFunctions,
    })
    const { flatItems } = useGroupedItems(sortedItems, groupBy, opened)
    const itemsLength = computed(() => flatItems.value.length)

    const { startIndex, stopIndex, pageCount, setItemsPerPage } = providePagination({ page, itemsPerPage, itemsLength })
    const { paginatedItems } = usePaginatedItems({ items: flatItems, startIndex, stopIndex, itemsPerPage })

    const paginatedItemsWithoutGroups = computed(() => extractRows(paginatedItems.value))

    const {
      isSelected,
      select,
      selectAll,
      toggleSelect,
      someSelected,
      allSelected,
    } = provideSelection(props, { allItems: items, currentPage: paginatedItemsWithoutGroups })

    const { isExpanded, toggleExpand } = provideExpanded(props)

    useOptions({
      page,
      itemsPerPage,
      sortBy,
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

    const slotProps = computed<CDataTableSlotProps<any>>(() => ({
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      sortBy: sortBy.value,
      pageCount: pageCount.value,
      toggleSort,
      setItemsPerPage,
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
      items: paginatedItemsWithoutGroups.value.map(item => item.raw),
      internalItems: paginatedItemsWithoutGroups.value,
      groupedItems: paginatedItems.value,
      columns: columns.value,
      headers: headers.value,
    }))

    useRender(() => {
      const dataTableFooterProps = CDataTableFooter.filterProps(props)
      const dataTableHeadersProps = CDataTableHeaders.filterProps(props)
      const dataTableRowsProps = CDataTableRows.filterProps(props)
      const tableProps = CTable.filterProps(props)

      return (
        <CTable
          class={[
            'v-data-table',
            {
              'v-data-table--show-select': props.showSelect,
              'v-data-table--loading': props.loading,
            },
            props.class,
          ]}
          style={props.style}
          {...tableProps}
        >
          {{
            top: () => slots.top?.(slotProps.value),
            default: () => slots.default
              ? slots.default(slotProps.value)
              : (
                <>
                  { slots.colgroup?.(slotProps.value) }
                  { !props.hideDefaultHeader && (
                    <thead key="thead">
                      <CDataTableHeaders
                        {...dataTableHeadersProps}
                        v-slots={slots}
                      />
                    </thead>
                  )}
                  { slots.thead?.(slotProps.value) }
                  <tbody>
                    { slots['body.prepend']?.(slotProps.value) }
                    { slots.body
                      ? slots.body(slotProps.value)
                      : (
                        <CDataTableRows
                          {...attrs}
                          {...dataTableRowsProps}
                          items={paginatedItems.value}
                          v-slots={slots}
                        />
                        )}
                    { slots['body.append']?.(slotProps.value) }
                  </tbody>
                  { slots.tbody?.(slotProps.value) }
                  { slots.tfoot?.(slotProps.value) }
                </>
                ),
            bottom: () => slots.bottom
              ? slots.bottom(slotProps.value)
              : !props.hideDefaultFooter && (
                <>
                  <CDivider />

                  <CDataTableFooter
                    {...dataTableFooterProps}
                    v-slots={{
                      prepend: slots['footer.prepend'],
                    }}
                  />
                </>
                ),
          }}
        </CTable>
      )
    })

    return {}
  },
})

export type CDataTable = InstanceType<typeof CDataTable>
