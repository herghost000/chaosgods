import { computed, mergeProps } from 'vue'
import type { CSSProperties, PropType, UnwrapRef } from 'vue'
import { CDataTableColumn } from './CDataTableColumn'
import { useHeaders } from './composables/headers'
import { useSelection } from './composables/select'
import { useSort } from './composables/sort'
import type { provideSelection } from './composables/select'
import type { provideSort } from './composables/sort'
import type { InternalDataTableHeader } from './types'
import { CCheckboxBtn } from '@/components/CCheckbox'
import { CChip } from '@/components/CChip'
import { CIcon } from '@/components/CIcon'
import { CSelect } from '@/components/CSelect'
import { useBackgroundColor } from '@/composables/color'
import { makeDisplayProps, useDisplay } from '@/composables/display'
import { IconValue } from '@/composables/icons'
import { LoaderSlot, makeLoaderProps, useLoader } from '@/composables/loader'
import { useLocale } from '@/composables/locale'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'
import type { ItemProps } from '@/composables/list-items'
import type { LoaderSlotProps } from '@/composables/loader'

export type HeadersSlotProps = {
  headers: InternalDataTableHeader[][]
  columns: InternalDataTableHeader[]
  sortBy: UnwrapRef<ReturnType<typeof provideSort>['sortBy']>
  someSelected: UnwrapRef<ReturnType<typeof provideSelection>['someSelected']>
  allSelected: UnwrapRef<ReturnType<typeof provideSelection>['allSelected']>
  toggleSort: ReturnType<typeof provideSort>['toggleSort']
  selectAll: ReturnType<typeof provideSelection>['selectAll']
  getSortIcon: (column: InternalDataTableHeader) => IconValue
  isSorted: ReturnType<typeof provideSort>['isSorted']
}

export type CDataTableHeaderCellColumnSlotProps = {
  column: InternalDataTableHeader
  selectAll: ReturnType<typeof provideSelection>['selectAll']
  isSorted: ReturnType<typeof provideSort>['isSorted']
  toggleSort: ReturnType<typeof provideSort>['toggleSort']
  sortBy: UnwrapRef<ReturnType<typeof provideSort>['sortBy']>
  someSelected: UnwrapRef<ReturnType<typeof provideSelection>['someSelected']>
  allSelected: UnwrapRef<ReturnType<typeof provideSelection>['allSelected']>
  getSortIcon: (column: InternalDataTableHeader) => IconValue
}

export type CDataTableHeadersSlots = {
  'headers': HeadersSlotProps
  'loader': LoaderSlotProps
  'header.data-table-select': CDataTableHeaderCellColumnSlotProps
  'header.data-table-expand': CDataTableHeaderCellColumnSlotProps
} & { [key: `header.${string}`]: CDataTableHeaderCellColumnSlotProps }

export const makeCDataTableHeadersProps = propsFactory({
  color: String,
  sticky: Boolean,
  multiSort: Boolean,
  sortAscIcon: {
    type: IconValue,
    default: '$sortAsc',
  },
  sortDescIcon: {
    type: IconValue,
    default: '$sortDesc',
  },
  headerProps: {
    type: Object as PropType<Record<string, any>>,
  },

  ...makeDisplayProps(),
  ...makeLoaderProps(),
}, 'CDataTableHeaders')

export const CDataTableHeaders = genericComponent<CDataTableHeadersSlots>()({
  name: 'CDataTableHeaders',

  props: makeCDataTableHeadersProps(),

  setup(props, { slots }) {
    const { t } = useLocale()
    const { toggleSort, sortBy, isSorted } = useSort()
    const { someSelected, allSelected, selectAll, showSelectAll } = useSelection()
    const { columns, headers } = useHeaders()
    const { loaderClasses } = useLoader(props)

    function getFixedStyles(column: InternalDataTableHeader, y: number): CSSProperties | undefined {
      if (!props.sticky && !column.fixed)
        return undefined

      return {
        position: 'sticky',
        left: column.fixed ? convertToUnit(column.fixedOffset) : undefined,
        top: props.sticky ? `calc(var(--v-table-header-height) * ${y})` : undefined,
      }
    }

    function getSortIcon(column: InternalDataTableHeader) {
      const item = sortBy.value.find(item => item.key === column.key)

      if (!item)
        return props.sortAscIcon

      return item.order === 'asc' ? props.sortAscIcon : props.sortDescIcon
    }

    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'color')

    const { displayClasses, mobile } = useDisplay(props)

    const slotProps = computed(() => ({
      headers: headers.value,
      columns: columns.value,
      toggleSort,
      isSorted,
      sortBy: sortBy.value,
      someSelected: someSelected.value,
      allSelected: allSelected.value,
      selectAll,
      getSortIcon,
    } satisfies HeadersSlotProps))

    const headerCellClasses = computed(() => ([
      'v-data-table__th',
      {
        'v-data-table__th--sticky': props.sticky,
      },
      displayClasses.value,
      loaderClasses.value,
    ]))

    const CDataTableHeaderCell = ({ column, y }: { column: InternalDataTableHeader, x: number, y: number }) => {
      const noPadding = column.key === 'data-table-select' || column.key === 'data-table-expand'
      const headerProps = mergeProps(props.headerProps ?? {}, column.headerProps ?? {})

      return (
        <CDataTableColumn
          tag="th"
          align={column.align}
          class={[
            {
              'v-data-table__th--sortable': column.sortable,
              'v-data-table__th--sorted': isSorted(column),
              'v-data-table__th--fixed': column.fixed,
            },
            ...headerCellClasses.value,
          ]}
          style={{
            width: convertToUnit(column.width),
            minWidth: convertToUnit(column.minWidth),
            maxWidth: convertToUnit(column.maxWidth),
            ...getFixedStyles(column, y),
          }}
          colspan={column.colspan}
          rowspan={column.rowspan}
          onClick={column.sortable ? () => toggleSort(column) : undefined}
          fixed={column.fixed}
          nowrap={column.nowrap}
          lastFixed={column.lastFixed}
          noPadding={noPadding}
          {...headerProps}
        >
          {{
            default: () => {
              const columnSlotName = `header.${column.key}` as const
              const columnSlotProps: CDataTableHeaderCellColumnSlotProps = {
                column,
                selectAll,
                isSorted,
                toggleSort,
                sortBy: sortBy.value,
                someSelected: someSelected.value,
                allSelected: allSelected.value,
                getSortIcon,
              }

              if (slots[columnSlotName])
                return slots[columnSlotName]!(columnSlotProps)

              if (column.key === 'data-table-select') {
                return slots['header.data-table-select']?.(columnSlotProps) ?? (showSelectAll.value && (
                  <CCheckboxBtn
                    modelValue={allSelected.value}
                    indeterminate={someSelected.value && !allSelected.value}
                    onUpdate:modelValue={selectAll}
                  />
                ))
              }

              return (
                <div class="v-data-table-header__content">
                  <span>{ column.title }</span>
                  { column.sortable && (
                    <CIcon
                      key="icon"
                      class="v-data-table-header__sort-icon"
                      icon={getSortIcon(column)}
                    />
                  )}
                  { props.multiSort && isSorted(column) && (
                    <div
                      key="badge"
                      class={[
                        'v-data-table-header__sort-badge',
                        ...backgroundColorClasses.value,
                      ]}
                      style={backgroundColorStyles.value}
                    >
                      { sortBy.value.findIndex(x => x.key === column.key) + 1 }
                    </div>
                  )}
                </div>
              )
            },
          }}
        </CDataTableColumn>
      )
    }

    const CDataTableMobileHeaderCell = () => {
      const headerProps = mergeProps(props.headerProps ?? {} ?? {})

      const displayItems = computed<ItemProps['items']>(() => {
        return columns.value.filter(column => column?.sortable)
      })

      const appendIcon = computed(() => {
        const showSelectColumn = columns.value.find(column => column.key === 'data-table-select')

        if (showSelectColumn == null)
          return

        return allSelected.value ? '$checkboxOn' : someSelected.value ? '$checkboxIndeterminate' : '$checkboxOff'
      })

      return (
        <CDataTableColumn
          tag="th"
          class={[
            ...headerCellClasses.value,
          ]}
          colspan={headers.value.length + 1}
          {...headerProps}
        >
          <div class="v-data-table-header__content">
            <CSelect
              chips
              class="v-data-table__td-sort-select"
              clearable
              density="default"
              items={displayItems.value}
              label={t('$chaos.dataTable.sortBy')}
              multiple={props.multiSort}
              variant="underlined"
              onClick:clear={() => sortBy.value = []}
              appendIcon={appendIcon.value}
              onClick:append={() => selectAll(!allSelected.value)}
            >
              {{
                ...slots,
                chip: props => (
                  <CChip
                    onClick={props.item.raw?.sortable ? () => toggleSort(props.item.raw) : undefined}
                    onMousedown={(e: MouseEvent) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    { props.item.title }
                    <CIcon
                      class={[
                        'v-data-table__td-sort-icon',
                        isSorted(props.item.raw) && 'v-data-table__td-sort-icon-active',
                      ]}
                      icon={getSortIcon(props.item.raw)}
                      size="small"
                    />
                  </CChip>
                ),
              }}
            </CSelect>
          </div>
        </CDataTableColumn>
      )
    }

    useRender(() => {
      return mobile.value
        ? (
          <tr>
            <CDataTableMobileHeaderCell />
          </tr>
          )
        : (
          <>
            { slots.headers
              ? slots.headers(slotProps.value)
              : headers.value.map((row, y) => (
                <tr>
                  { row.map((column, x) => (
                    <CDataTableHeaderCell column={column} x={x} y={y} />
                  ))}
                </tr>
              ))}

            { props.loading && (
              <tr class="v-data-table-progress">
                <th colspan={columns.value.length}>
                  <LoaderSlot
                    name="v-data-table-progress"
                    absolute
                    active
                    color={typeof props.loading === 'boolean' ? undefined : props.loading}
                    indeterminate
                    v-slots={{ default: slots.loader }}
                  />
                </th>
              </tr>
            )}
          </>
          )
    })
  },
})

export type CDataTableHeaders = InstanceType<typeof CDataTableHeaders>
