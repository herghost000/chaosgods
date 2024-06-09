import { computed, provide, toRef } from 'vue'
import { makeDataTableProps } from './CDataTable'
import { CDataTableFooter, makeCDataTableFooterProps } from './CDataTableFooter'
import { CDataTableHeaders } from './CDataTableHeaders'
import { CDataTableRows } from './CDataTableRows'
import { provideExpanded } from './composables/expand'
import { createGroupBy, provideGroupBy, useGroupedItems } from './composables/group'
import { createHeaders } from './composables/headers'
import { useDataTableItems } from './composables/items'
import { useOptions } from './composables/options'
import { createPagination, makeDataTablePaginateProps, providePagination } from './composables/paginate'
import { provideSelection } from './composables/select'
import { createSort, provideSort } from './composables/sort'
import type { CDataTableSlotProps, CDataTableSlots } from './CDataTable'
import { provideDefaults } from '@/composables/defaults'
import { genericComponent, propsFactory, useRender } from '@/util'
import { CTable } from '@/components/CTable'
import { CDivider } from '@/components/CDivider'
import type { CellProps, RowProps } from '@/components/CDataTable/types'
import type { GenericProps, SelectItemKey } from '@/util'

export const makeCDataTableServerProps = propsFactory({
  itemsLength: {
    type: [Number, String],
    required: true,
  },

  ...makeDataTablePaginateProps(),
  ...makeDataTableProps(),
  ...makeCDataTableFooterProps(),
}, 'CDataTableServer')

type ItemType<T> = T extends readonly (infer U)[] ? U : never

export const CDataTableServer = genericComponent<new<T extends readonly any[], V>(
  props: {
    'items'?: T
    'itemValue'?: SelectItemKey<ItemType<T>>
    'rowProps'?: RowProps<ItemType<T>>
    'cellProps'?: CellProps<ItemType<T>>
    'itemSelectable'?: SelectItemKey<ItemType<T>>
    'modelValue'?: V
    'onUpdate:modelValue'?: (value: V) => void
  },
  slots: CDataTableSlots<ItemType<T>>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataTableServer',

  props: makeCDataTableServerProps(),

  emits: {
    'update:modelValue': (_value: any[]) => true,
    'update:page': (_page: number) => true,
    'update:itemsPerPage': (_page: number) => true,
    'update:sortBy': (_sortBy: any) => true,
    'update:options': (_options: any) => true,
    'update:expanded': (_options: any) => true,
    'update:groupBy': (_value: any) => true,
  },

  setup(props, { attrs, slots }) {
    const { groupBy } = createGroupBy(props)
    const { sortBy, multiSort, mustSort } = createSort(props)
    const { page, itemsPerPage } = createPagination(props)
    const itemsLength = computed(() => Number.parseInt(`${props.itemsLength}`, 10))

    const { columns, headers } = createHeaders(props, {
      groupBy,
      showSelect: toRef(props, 'showSelect'),
      showExpand: toRef(props, 'showExpand'),
    })

    const { items } = useDataTableItems(props, columns)

    const { toggleSort } = provideSort({ sortBy, multiSort, mustSort, page })

    const { opened, isGroupOpen, toggleGroup, extractRows } = provideGroupBy({ groupBy, sortBy })

    const { pageCount, setItemsPerPage } = providePagination({ page, itemsPerPage, itemsLength })

    const { flatItems } = useGroupedItems(items, groupBy, opened)

    const { isSelected, select, selectAll, toggleSelect, someSelected, allSelected } = provideSelection(props, {
      allItems: items,
      currentPage: items,
    })

    const { isExpanded, toggleExpand } = provideExpanded(props)

    const itemsWithoutGroups = computed(() => extractRows(items.value))

    useOptions({
      page,
      itemsPerPage,
      sortBy,
      groupBy,
      search: toRef(props, 'search'),
    })

    provide('v-data-table', {
      toggleSort,
      sortBy,
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
      items: itemsWithoutGroups.value.map(item => item.raw),
      internalItems: itemsWithoutGroups.value,
      groupedItems: flatItems.value,
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
                    <thead key="thead" class="v-data-table__thead" role="rowgroup">
                      <CDataTableHeaders
                        {...dataTableHeadersProps}
                        sticky={props.fixedHeader}
                        v-slots={slots}
                      />
                    </thead>
                  )}
                  { slots.thead?.(slotProps.value) }
                  <tbody class="v-data-table__tbody" role="rowgroup">
                    { slots['body.prepend']?.(slotProps.value) }
                    { slots.body
                      ? slots.body(slotProps.value)
                      : (
                        <CDataTableRows
                          {...attrs}
                          {...dataTableRowsProps}
                          items={flatItems.value}
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
  },
})

export type CDataTableServer = InstanceType<typeof CDataTableServer>
