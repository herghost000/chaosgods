import './CStepper.sass'
import { computed, toRefs } from 'vue'
import type { InjectionKey, PropType } from 'vue'
import { CStepperActions, makeCStepperActionsProps } from './CStepperActions'
import { CStepperHeader } from './CStepperHeader'
import { CStepperItem } from './CStepperItem'
import { CStepperWindow } from './CStepperWindow'
import { CStepperWindowItem } from './CStepperWindowItem'
import type { StepperItem, StepperItemSlot } from './CStepperItem'
import { CDivider } from '@/components/CDivider'
import { CSheet, makeCSheetProps } from '@/components/CSheet/CSheet'
import { provideDefaults } from '@/composables/defaults'
import { makeGroupProps, useGroup } from '@/composables/group'
import { genericComponent, getPropertyFromItem, only, propsFactory, useRender } from '@/util'
import type { GroupItemProvide } from '@/composables/group'

export const CStepperSymbol: InjectionKey<GroupItemProvide> = Symbol.for('chaos:v-stepper')

export type CStepperSlot = {
  prev: () => void
  next: () => void
}

export type CStepperSlots = {
  'actions': CStepperSlot
  'default': CStepperSlot
  'header': StepperItem
  'header-item': StepperItemSlot
  'icon': StepperItemSlot
  'title': StepperItemSlot
  'subtitle': StepperItemSlot
  'item': StepperItem
  'prev': never
  'next': never
} & {
  [key: `header-item.${string}`]: StepperItemSlot
  [key: `item.${string}`]: StepperItem
}

export const makeStepperProps = propsFactory({
  altLabels: Boolean,
  bgColor: String,
  editable: Boolean,
  hideActions: Boolean,
  items: {
    type: Array as PropType<readonly StepperItem[]>,
    default: () => ([]),
  },
  itemTitle: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  mobile: Boolean,
  nonLinear: Boolean,
  flat: Boolean,
}, 'Stepper')

export const makeCStepperProps = propsFactory({
  ...makeStepperProps(),
  ...makeGroupProps({
    mandatory: 'force' as const,
    selectedClass: 'v-stepper-item--selected',
  }),
  ...makeCSheetProps(),
  ...only(makeCStepperActionsProps(), ['prevText', 'nextText']),
}, 'CStepper')

export const CStepper = genericComponent<CStepperSlots>()({
  name: 'CStepper',

  props: makeCStepperProps(),

  emits: {
    'update:modelValue': (_v: unknown) => true,
  },

  setup(props, { slots }) {
    const { items: _items, next, prev, selected } = useGroup(props, CStepperSymbol)
    const { color, editable, prevText, nextText } = toRefs(props)

    const items = computed(() => props.items.map((item, index) => {
      const title = getPropertyFromItem(item, props.itemTitle, item)
      const value = getPropertyFromItem(item, props.itemValue, index + 1)

      return {
        title,
        value,
        raw: item,
      }
    }))
    const activeIndex = computed(() => {
      return _items.value.findIndex(item => selected.value.includes(item.id))
    })
    const disabled = computed(() => {
      if (props.disabled)
        return props.disabled
      if (activeIndex.value === 0)
        return 'prev'
      if (activeIndex.value === _items.value.length - 1)
        return 'next'

      return false
    })

    provideDefaults({
      CStepperItem: {
        editable,
        prevText,
        nextText,
      },
      CStepperActions: {
        color,
        disabled,
        prevText,
        nextText,
      },
    })

    useRender(() => {
      const sheetProps = CSheet.filterProps(props)

      const hasHeader = !!(slots.header || props.items.length)
      const hasWindow = props.items.length > 0
      const hasActions = !props.hideActions && !!(hasWindow || slots.actions)

      return (
        <CSheet
          {...sheetProps}
          color={props.bgColor}
          class={[
            'v-stepper',
            {
              'v-stepper--alt-labels': props.altLabels,
              'v-stepper--flat': props.flat,
              'v-stepper--non-linear': props.nonLinear,
              'v-stepper--mobile': props.mobile,
            },
            props.class,
          ]}
          style={props.style}
        >
          { hasHeader && (
            <CStepperHeader key="stepper-header">
              { items.value.map(({ raw, ...item }, index) => (
                <>
                  { !!index && (<CDivider />) }

                  <CStepperItem
                    {...item}
                    v-slots={{
                      default: slots[`header-item.${item.value}`] ?? slots.header,
                      icon: slots.icon,
                      title: slots.title,
                      subtitle: slots.subtitle,
                    }}
                  />
                </>
              ))}
            </CStepperHeader>
          )}

          { hasWindow && (
            <CStepperWindow key="stepper-window">
              { items.value.map(item => (
                <CStepperWindowItem
                  value={item.value}
                  v-slots={{
                    default: () => slots[`item.${item.value}`]?.(item) ?? slots.item?.(item),
                  }}
                />
              ))}
            </CStepperWindow>
          )}

          { slots.default?.({ prev, next }) }

          { hasActions && (
            slots.actions?.({ next, prev }) ?? (
              <CStepperActions
                key="stepper-actions"
                onClick:prev={prev}
                onClick:next={next}
                v-slots={slots}
              />
            )
          )}
        </CSheet>
      )
    })

    return {
      prev,
      next,
    }
  },
})

export type CStepper = InstanceType<typeof CStepper>
