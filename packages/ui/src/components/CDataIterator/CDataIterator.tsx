import { computed, toRef } from 'vue'
import type { Component } from 'vue'
import { makeDataIteratorItemsProps, useDataIteratorItems } from './composables/items'
import type { DataIteratorItem } from './composables/items'
import { CFadeTransition } from '@/components/transitions'
import { makeDataTableExpandProps, provideExpanded } from '@/components/CDataTable/composables/expand'
import { makeDataTableGroupProps, provideGroupBy, useGroupedItems } from '@/components/CDataTable/composables/group'
import { useOptions } from '@/components/CDataTable/composables/options'
import {
  createPagination,
  makeDataTablePaginateProps,
  providePagination,
  usePaginatedItems,
} from '@/components/CDataTable/composables/paginate'
import { makeDataTableSelectProps, provideSelection } from '@/components/CDataTable/composables/select'
import { createSort, makeDataTableSortProps, provideSort, useSortedItems } from '@/components/CDataTable/composables/sort'
import { makeComponentProps } from '@/composables/component'
import { makeFilterProps, useFilter } from '@/composables/filter'
import { LoaderSlot } from '@/composables/loader'
import { useProxiedModel } from '@/composables/proxiedModel'
import { makeTagProps } from '@/composables/tag'
import { MaybeTransition, makeTransitionProps } from '@/composables/transition'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { Group } from '@/components/CDataTable/composables/group'
import type { SortItem } from '@/components/CDataTable/composables/sort'
import type { LoaderSlotProps } from '@/composables/loader'
import type { GenericProps } from '@/util'

type CDataIteratorSlotProps<T> = {
  page: number
  itemsPerPage: number
  sortBy: readonly SortItem[]
  pageCount: number
  toggleSort: ReturnType<typeof provideSort>['toggleSort']
  prevPage: ReturnType<typeof providePagination>['prevPage']
  nextPage: ReturnType<typeof providePagination>['nextPage']
  setPage: ReturnType<typeof providePagination>['setPage']
  setItemsPerPage: ReturnType<typeof providePagination>['setItemsPerPage']
  isSelected: ReturnType<typeof provideSelection>['isSelected']
  select: ReturnType<typeof provideSelection>['select']
  selectAll: ReturnType<typeof provideSelection>['selectAll']
  toggleSelect: ReturnType<typeof provideSelection>['toggleSelect']
  isExpanded: ReturnType<typeof provideExpanded>['isExpanded']
  toggleExpand: ReturnType<typeof provideExpanded>['toggleExpand']
  isGroupOpen: ReturnType<typeof provideGroupBy>['isGroupOpen']
  toggleGroup: ReturnType<typeof provideGroupBy>['toggleGroup']
  items: readonly DataIteratorItem<T>[]
  groupedItems: readonly (DataIteratorItem<T> | Group<DataIteratorItem<T>>)[]
}

export type CDataIteratorSlots<T> = {
  'default': CDataIteratorSlotProps<T>
  'header': CDataIteratorSlotProps<T>
  'footer': CDataIteratorSlotProps<T>
  'loader': LoaderSlotProps
  'no-data': never
}

export const makeCDataIteratorProps = propsFactory({
  search: String,
  loading: Boolean,

  ...makeComponentProps(),
  ...makeDataIteratorItemsProps(),
  ...makeDataTableSelectProps(),
  ...makeDataTableSortProps(),
  ...makeDataTablePaginateProps({ itemsPerPage: 5 }),
  ...makeDataTableExpandProps(),
  ...makeDataTableGroupProps(),
  ...makeFilterProps(),
  ...makeTagProps(),
  ...makeTransitionProps({
    transition: {
      component: CFadeTransition as Component,
      hideOnLeave: true,
    },
  }),
}, 'CDataIterator')

export const CDataIterator = genericComponent<new<T> (
  props: {
    items?: readonly T[]
  },
  slots: CDataIteratorSlots<T>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDataIterator',

  props: makeCDataIteratorProps(),

  emits: {
    'update:modelValue': (_value: any[]) => true,
    'update:groupBy': (_value: any) => true,
    'update:page': (_value: number) => true,
    'update:itemsPerPage': (_value: number) => true,
    'update:sortBy': (_value: any) => true,
    'update:options': (_value: any) => true,
    'update:expanded': (_value: any) => true,
    'update:currentItems': (_value: any) => true,
  },

  setup(props, { slots }) {
    const groupBy = useProxiedModel(props, 'groupBy')
    const search = toRef(props, 'search')

    const { items } = useDataIteratorItems(props)
    const { filteredItems } = useFilter(props, items, search, { transform: item => item.raw })

    const { sortBy, multiSort, mustSort } = createSort(props)
    const { page, itemsPerPage } = createPagination(props)

    const { toggleSort } = provideSort({ sortBy, multiSort, mustSort, page })
    const { sortByWithGroups, opened, extractRows, isGroupOpen, toggleGroup } = provideGroupBy({ groupBy, sortBy })

    const { sortedItems } = useSortedItems(props, filteredItems, sortByWithGroups, { transform: item => item.raw })
    const { flatItems } = useGroupedItems(sortedItems, groupBy, opened)

    const itemsLength = computed(() => flatItems.value.length)

    const {
      startIndex,
      stopIndex,
      pageCount,
      prevPage,
      nextPage,
      setItemsPerPage,
      setPage,
    } = providePagination({ page, itemsPerPage, itemsLength })
    const { paginatedItems } = usePaginatedItems({ items: flatItems, startIndex, stopIndex, itemsPerPage })

    const paginatedItemsWithoutGroups = computed(() => extractRows(paginatedItems.value))

    const {
      isSelected,
      select,
      selectAll,
      toggleSelect,
    } = provideSelection(props, { allItems: items, currentPage: paginatedItemsWithoutGroups })
    const { isExpanded, toggleExpand } = provideExpanded(props)

    useOptions({
      page,
      itemsPerPage,
      sortBy,
      groupBy,
      search,
    })

    const slotProps = computed(() => ({
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      sortBy: sortBy.value,
      pageCount: pageCount.value,
      toggleSort,
      prevPage,
      nextPage,
      setPage,
      setItemsPerPage,
      isSelected,
      select,
      selectAll,
      toggleSelect,
      isExpanded,
      toggleExpand,
      isGroupOpen,
      toggleGroup,
      items: paginatedItemsWithoutGroups.value,
      groupedItems: paginatedItems.value,
    }))

    useRender(() => (
      <props.tag
        class={[
          'v-data-iterator',
          {
            'v-data-iterator--loading': props.loading,
          },
          props.class,
        ]}
        style={props.style}
      >
        { slots.header?.(slotProps.value) }

        <MaybeTransition transition={props.transition}>
          { props.loading
            ? (
              <LoaderSlot key="loader" name="v-data-iterator" active>
                { slotProps => slots.loader?.(slotProps) }
              </LoaderSlot>
              )
            : (
              <div key="items">
                { !paginatedItems.value.length
                  ? slots['no-data']?.()
                  : slots.default?.(slotProps.value)}
              </div>
              )}
        </MaybeTransition>

        { slots.footer?.(slotProps.value) }
      </props.tag>
    ))

    return {}
  },
})

export type CDataIterator = InstanceType<typeof CDataIterator>
