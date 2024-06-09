import './CBtnToggle.sass'
import type { InjectionKey } from 'vue'
import { CBtnGroup, makeCBtnGroupProps } from '@/components/CBtnGroup/CBtnGroup'
import { makeGroupProps, useGroup } from '@/composables/group'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { GroupProvide } from '@/composables/group'
import type { GenericProps } from '@/util'

export type BtnToggleSlotProps = 'isSelected' | 'select' | 'selected' | 'next' | 'prev'
export interface DefaultBtnToggleSlot extends Pick<GroupProvide, BtnToggleSlotProps> {}

export const CBtnToggleSymbol: InjectionKey<GroupProvide> = Symbol.for('chaos:v-btn-toggle')

type VBtnToggleSlots = {
  default: DefaultBtnToggleSlot
}

export const makeCBtnToggleProps = propsFactory({
  ...makeCBtnGroupProps(),
  ...makeGroupProps(),
}, 'CBtnToggle')

export const CBtnToggle = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: VBtnToggleSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CBtnToggle',

  props: makeCBtnToggleProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const { isSelected, next, prev, select, selected } = useGroup(props, CBtnToggleSymbol)

    useRender(() => {
      const btnGroupProps = CBtnGroup.filterProps(props)

      return (
        <CBtnGroup
          class={[
            'v-btn-toggle',
            props.class,
          ]}
          {...btnGroupProps}
          style={props.style}
        >
          { slots.default?.({
            isSelected,
            next,
            prev,
            select,
            selected,
          })}
        </CBtnGroup>
      )
    })

    return {
      next,
      prev,
      select,
    }
  },
})

export type CBtnToggle = InstanceType<typeof CBtnToggle>
