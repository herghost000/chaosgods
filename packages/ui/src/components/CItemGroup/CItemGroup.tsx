import './CItemGroup.sass'
import { makeComponentProps } from '@/composables/component'
import { makeGroupProps, useGroup } from '@/composables/group'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genericComponent, propsFactory } from '@/util'
import type { GenericProps } from '@/util'

export const CItemGroupSymbol = Symbol.for('chaos:v-item-group')

export const makeCItemGroupProps = propsFactory({
  ...makeComponentProps(),
  ...makeGroupProps({
    selectedClass: 'v-item--selected',
  }),
  ...makeTagProps(),
  ...makeThemeProps(),
}, 'CItemGroup')

type CItemGroupSlots = {
  default: {
    isSelected: (id: number) => boolean
    select: (id: number, value: boolean) => void
    next: () => void
    prev: () => void
    selected: readonly number[]
  }
}

export const CItemGroup = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: CItemGroupSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CItemGroup',

  props: makeCItemGroupProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)
    const { isSelected, select, next, prev, selected } = useGroup(props, CItemGroupSymbol)

    return () => (
      <props.tag
        class={[
          'v-item-group',
          themeClasses.value,
          props.class,
        ]}
        style={props.style}
      >
        { slots.default?.({
          isSelected,
          select,
          next,
          prev,
          selected: selected.value,
        })}
      </props.tag>
    )
  },
})

export type CItemGroup = InstanceType<typeof CItemGroup>
