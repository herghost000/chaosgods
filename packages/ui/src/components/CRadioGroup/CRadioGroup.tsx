import './CRadioGroup.sass'
import { computed } from 'vue'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { CLabel } from '@/components/CLabel'
import { CSelectionControl } from '@/components/CSelectionControl'
import { CSelectionControlGroup, makeSelectionControlGroupProps } from '@/components/CSelectionControlGroup/CSelectionControlGroup'
import { IconValue } from '@/composables/icons'
import { useProxiedModel } from '@/composables/proxiedModel'
import { filterInputAttrs, genericComponent, getUid, omit, propsFactory, useRender } from '@/util'
import type { CInputSlots } from '@/components/CInput/CInput'
import type { GenericProps } from '@/util'

export type CRadioGroupSlots = Omit<CInputSlots, 'default'> & {
  default: never
  label: {
    label: string | undefined
    props: Record<string, any>
  }
}

export const makeCRadioGroupProps = propsFactory({
  height: {
    type: [Number, String],
    default: 'auto',
  },

  ...makeCInputProps(),
  ...omit(makeSelectionControlGroupProps(), ['multiple']),

  trueIcon: {
    type: IconValue,
    default: '$radioOn',
  },
  falseIcon: {
    type: IconValue,
    default: '$radioOff',
  },
  type: {
    type: String,
    default: 'radio',
  },
}, 'CRadioGroup')

export const CRadioGroup = genericComponent<new<T>(
  props: {
    'modelValue'?: T | null
    'onUpdate:modelValue'?: (value: T | null) => void
  },
  slots: CRadioGroupSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CRadioGroup',

  inheritAttrs: false,

  props: makeCRadioGroupProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { attrs, slots }) {
    const uid = getUid()
    const id = computed(() => props.id || `radio-group-${uid}`)
    const model = useProxiedModel(props, 'modelValue')

    useRender(() => {
      const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)
      const inputProps = CInput.filterProps(props)
      const controlProps = CSelectionControl.filterProps(props)
      const label = slots.label
        ? slots.label({
          label: props.label,
          props: { for: id.value },
        })
        : props.label

      return (
        <CInput
          class={[
            'v-radio-group',
            props.class,
          ]}
          style={props.style}
          {...rootAttrs}
          {...inputProps}
          v-model={model.value}
          id={id.value}
        >
          {{
            ...slots,
            default: ({
              id,
              messagesId,
              isDisabled,
              isReadonly,
            }) => (
              <>
                { label && (
                  <CLabel id={id.value}>
                    { label }
                  </CLabel>
                )}

                <CSelectionControlGroup
                  {...controlProps}
                  id={id.value}
                  aria-describedby={messagesId.value}
                  defaultsTarget="CRadio"
                  trueIcon={props.trueIcon}
                  falseIcon={props.falseIcon}
                  type={props.type}
                  disabled={isDisabled.value}
                  readonly={isReadonly.value}
                  aria-labelledby={label ? id.value : undefined}
                  multiple={false}
                  {...controlAttrs}
                  v-model={model.value}
                  v-slots={slots}
                />
              </>
            ),
          }}
        </CInput>
      )
    })

    return {}
  },
})

export type CRadioGroup = InstanceType<typeof CRadioGroup>
