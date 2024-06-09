import type { UnwrapRef } from 'vue'
import { CSlideGroupSymbol } from './CSlideGroup'
import { makeGroupItemProps, useGroupItem } from '@/composables/group'
import { genericComponent } from '@/util'
import type { GroupItemProvide } from '@/composables/group'

type CSlideGroupItemSlots = {
  default: {
    isSelected: UnwrapRef<GroupItemProvide['isSelected']>
    select: GroupItemProvide['select']
    toggle: GroupItemProvide['toggle']
    selectedClass: UnwrapRef<GroupItemProvide['selectedClass']>
  }
}

export const CSlideGroupItem = genericComponent<CSlideGroupItemSlots>()({
  name: 'CSlideGroupItem',

  props: makeGroupItemProps(),

  emits: {
    'group:selected': (_val: { value: boolean }) => true,
  },

  setup(props, { slots }) {
    const slideGroupItem = useGroupItem(props, CSlideGroupSymbol)

    return () => slots.default?.({
      isSelected: slideGroupItem.isSelected.value,
      select: slideGroupItem.select,
      toggle: slideGroupItem.toggle,
      selectedClass: slideGroupItem.selectedClass.value,
    })
  },
})

export type CSlideGroupItem = InstanceType<typeof CSlideGroupItem>
