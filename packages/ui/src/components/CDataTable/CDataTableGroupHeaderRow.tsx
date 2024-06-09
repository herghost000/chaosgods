import { computed } from 'vue'
import type { PropType } from 'vue'
import { CDataTableColumn } from './CDataTableColumn'
import { useGroupBy } from './composables/group'
import { useHeaders } from './composables/headers'
import { useSelection } from './composables/select'
import type { Group } from './composables/group'
import { genericComponent, propsFactory } from '@/util'
import { CCheckboxBtn } from '@/components/CCheckbox'
import { CBtn } from '@/components/CBtn'

export type CDataTableGroupHeaderRowSlots = {
  'data-table-group': { item: Group, count: number, props: Record<string, unknown> }
  'data-table-select': { props: Record<string, unknown> }
}

export const makeCDataTableGroupHeaderRowProps = propsFactory({
  item: {
    type: Object as PropType<Group>,
    required: true,
  },
}, 'CDataTableGroupHeaderRow')

export const CDataTableGroupHeaderRow = genericComponent<CDataTableGroupHeaderRowSlots>()({
  name: 'CDataTableGroupHeaderRow',

  props: makeCDataTableGroupHeaderRowProps(),

  setup(props, { slots }) {
    const { isGroupOpen, toggleGroup, extractRows } = useGroupBy()
    const { isSelected, isSomeSelected, select } = useSelection()
    const { columns } = useHeaders()

    const rows = computed(() => {
      return extractRows([props.item])
    })

    return () => (
      <tr
        class="v-data-table-group-header-row"
        style={{
          '--v-data-table-group-header-row-depth': props.item.depth,
        }}
      >
        { columns.value.map((column) => {
          if (column.key === 'data-table-group') {
            const icon = isGroupOpen(props.item) ? '$expand' : '$next'
            const onClick = () => toggleGroup(props.item)

            return slots['data-table-group']?.({ item: props.item, count: rows.value.length, props: { icon, onClick } }) ?? (
              <CDataTableColumn class="v-data-table-group-header-row__column">
                <CBtn
                  size="small"
                  variant="text"
                  icon={icon}
                  onClick={onClick}
                />
                <span>{ props.item.value }</span>
                <span>
                  (
                  { rows.value.length }
                  )
                </span>
              </CDataTableColumn>
            )
          }

          if (column.key === 'data-table-select') {
            const modelValue = isSelected(rows.value)
            const indeterminate = isSomeSelected(rows.value) && !modelValue
            const selectGroup = (v: boolean) => select(rows.value, v)
            return slots['data-table-select']?.({ props: { modelValue, indeterminate, 'onUpdate:modelValue': selectGroup } }) ?? (
              <td>
                <CCheckboxBtn
                  modelValue={modelValue}
                  indeterminate={indeterminate}
                  onUpdate:modelValue={selectGroup}
                />
              </td>
            )
          }

          return <td />
        })}
      </tr>
    )
  },
})
