import { CItemGroupSymbol } from './CItemGroup'
import { makeGroupItemProps, useGroupItem } from '@/composables/group'
import { genericComponent } from '@/util'

type CItemSlots = {
  default: {
    isSelected: boolean | undefined
    selectedClass: boolean | (string | undefined)[] | undefined
    select: ((value: boolean) => void) | undefined
    toggle: (() => void) | undefined
    value: unknown
    disabled: boolean | undefined
  }
}

export const CItem = genericComponent<CItemSlots>()({
  name: 'CItem',

  props: makeGroupItemProps(),

  emits: {
    'group:selected': (_val: { value: boolean }) => true,
  },

  setup(props, { slots }) {
    const { isSelected, select, toggle, selectedClass, value, disabled } = useGroupItem(props, CItemGroupSymbol)
    return () => slots.default?.({
      isSelected: isSelected.value,
      selectedClass: selectedClass.value,
      select,
      toggle,
      value: value.value,
      disabled: disabled.value,
    })
  },
})

export type CItem = InstanceType<typeof CItem>
