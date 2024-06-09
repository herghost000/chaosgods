import './CChipGroup.sass'
import { toRef } from 'vue'
import type { PropType } from 'vue'
import { CSlideGroup, makeCSlideGroupProps } from '@/components/CSlideGroup/CSlideGroup'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeGroupProps, useGroup } from '@/composables/group'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeVariantProps } from '@/composables/variant'
import { deepEqual, genericComponent, propsFactory, useRender } from '@/util'
import type { GenericProps } from '@/util'

export const CChipGroupSymbol = Symbol.for('chaos:v-chip-group')

export const makeCChipGroupProps = propsFactory({
  column: Boolean,
  filter: Boolean,
  valueComparator: {
    type: Function as PropType<typeof deepEqual>,
    default: deepEqual,
  },

  ...makeCSlideGroupProps(),
  ...makeComponentProps(),
  ...makeGroupProps({ selectedClass: 'v-chip--selected' }),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'tonal' } as const),
}, 'CChipGroup')

type CChipGroupSlots = {
  default: {
    isSelected: (id: number) => boolean
    select: (id: number, value: boolean) => void
    next: () => void
    prev: () => void
    selected: readonly number[]
  }
}

export const CChipGroup = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: CChipGroupSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CChipGroup',

  props: makeCChipGroupProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)
    const { isSelected, select, next, prev, selected } = useGroup(props, CChipGroupSymbol)

    provideDefaults({
      CChip: {
        color: toRef(props, 'color'),
        disabled: toRef(props, 'disabled'),
        filter: toRef(props, 'filter'),
        variant: toRef(props, 'variant'),
      },
    })

    useRender(() => {
      const slideGroupProps = CSlideGroup.filterProps(props)

      return (
        <CSlideGroup
          {...slideGroupProps}
          class={[
            'v-chip-group',
            {
              'v-chip-group--column': props.column,
            },
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
        </CSlideGroup>
      )
    })

    return {}
  },
})

export type CChipGroup = InstanceType<typeof CChipGroup>
