import { computed, inject, provide, watch, watchEffect } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import type { Group } from './group'
import { clamp, getCurrentInstance, propsFactory } from '@/util'
import { useProxiedModel } from '@/composables/proxiedModel'
import type { EventProp } from '@/util'

export const makeDataTablePaginateProps = propsFactory({
  page: {
    type: [Number, String],
    default: 1,
  },
  itemsPerPage: {
    type: [Number, String],
    default: 10,
  },
}, 'DataTable-paginate')

const CDataTablePaginationSymbol: InjectionKey<{
  page: Ref<number>
  itemsPerPage: Ref<number>
  startIndex: Ref<number>
  stopIndex: Ref<number>
  pageCount: Ref<number>
  itemsLength: Ref<number>
  prevPage: () => void
  nextPage: () => void
  setPage: (value: number) => void
  setItemsPerPage: (value: number) => void
}> = Symbol.for('chaos:data-table-pagination')

type PaginationProps = {
  'page': number | string
  'onUpdate:page': EventProp | undefined
  'itemsPerPage': number | string
  'onUpdate:itemsPerPage': EventProp | undefined
  'itemsLength'?: number | string
}

export function createPagination(props: PaginationProps) {
  const page = useProxiedModel(props, 'page', undefined, value => +(value ?? 1))
  const itemsPerPage = useProxiedModel(props, 'itemsPerPage', undefined, value => +(value ?? 10))

  return { page, itemsPerPage }
}

export function providePagination(options: {
  page: Ref<number>
  itemsPerPage: Ref<number>
  itemsLength: Ref<number>
}) {
  const { page, itemsPerPage, itemsLength } = options

  const startIndex = computed(() => {
    if (itemsPerPage.value === -1)
      return 0

    return itemsPerPage.value * (page.value - 1)
  })
  const stopIndex = computed(() => {
    if (itemsPerPage.value === -1)
      return itemsLength.value

    return Math.min(itemsLength.value, startIndex.value + itemsPerPage.value)
  })

  const pageCount = computed(() => {
    if (itemsPerPage.value === -1 || itemsLength.value === 0)
      return 1

    return Math.ceil(itemsLength.value / itemsPerPage.value)
  })

  watchEffect(() => {
    if (page.value > pageCount.value)
      page.value = pageCount.value
  })

  function setItemsPerPage(value: number) {
    itemsPerPage.value = value
    page.value = 1
  }

  function nextPage() {
    page.value = clamp(page.value + 1, 1, pageCount.value)
  }

  function prevPage() {
    page.value = clamp(page.value - 1, 1, pageCount.value)
  }

  function setPage(value: number) {
    page.value = clamp(value, 1, pageCount.value)
  }

  const data = { page, itemsPerPage, startIndex, stopIndex, pageCount, itemsLength, nextPage, prevPage, setPage, setItemsPerPage }

  provide(CDataTablePaginationSymbol, data)

  return data
}

export function usePagination() {
  const data = inject(CDataTablePaginationSymbol)

  if (!data)
    throw new Error('Missing pagination!')

  return data
}

export function usePaginatedItems<T>(options: {
  items: Ref<readonly (T | Group<T>)[]>
  startIndex: Ref<number>
  stopIndex: Ref<number>
  itemsPerPage: Ref<number>
}) {
  const vm = getCurrentInstance('usePaginatedItems')

  const { items, startIndex, stopIndex, itemsPerPage } = options
  const paginatedItems = computed(() => {
    if (itemsPerPage.value <= 0)
      return items.value

    return items.value.slice(startIndex.value, stopIndex.value)
  })

  watch(paginatedItems, (val) => {
    vm.emit('update:currentItems', val)
  })

  return { paginatedItems }
}
