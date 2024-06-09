import { computed } from 'vue'
import { CSelectionControl, makeCSelectionControlProps } from '@/components/CSelectionControl/CSelectionControl'
import { IconValue } from '@/composables/icons'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { CSelectionControlSlots } from '@/components/CSelectionControl/CSelectionControl'
import type { GenericProps } from '@/util'

export const makeCCheckboxBtnProps = propsFactory({
  indeterminate: Boolean,
  indeterminateIcon: {
    type: IconValue,
    default: '$checkboxIndeterminate',
  },

  ...makeCSelectionControlProps({
    falseIcon: '$checkboxOff',
    trueIcon: '$checkboxOn',
  }),
}, 'CCheckboxBtn')

export const CCheckboxBtn = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: CSelectionControlSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CCheckboxBtn',

  props: makeCCheckboxBtnProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
    'update:indeterminate': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const indeterminate = useProxiedModel(props, 'indeterminate')
    const model = useProxiedModel(props, 'modelValue')

    function onChange(_v: any) {
      if (indeterminate.value)
        indeterminate.value = false
    }

    const falseIcon = computed(() => {
      return indeterminate.value
        ? props.indeterminateIcon
        : props.falseIcon
    })

    const trueIcon = computed(() => {
      return indeterminate.value
        ? props.indeterminateIcon
        : props.trueIcon
    })

    useRender(() => {
      const controlProps = omit(CSelectionControl.filterProps(props), ['modelValue'])
      return (
        <CSelectionControl
          {...controlProps}
          v-model={model.value}
          class={[
            'v-checkbox-btn',
            props.class,
          ]}
          style={props.style}
          type="checkbox"
          onUpdate:modelValue={onChange}
          falseIcon={falseIcon.value}
          trueIcon={trueIcon.value}
          aria-checked={indeterminate.value ? 'mixed' : undefined}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CCheckboxBtn = InstanceType<typeof CCheckboxBtn>
