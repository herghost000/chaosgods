import './CInput.sass'
import { computed } from 'vue'
import type { ComputedRef, PropType, Ref } from 'vue'
import { useInputIcon } from '@/components/CInput/InputIcon'
import { CMessages } from '@/components/CMessages/CMessages'
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { IconValue } from '@/composables/icons'
import { useRtl } from '@/composables/locale'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeValidationProps, useValidation } from '@/composables/validation'
import { EventProp, genericComponent, getUid, only, propsFactory, useRender } from '@/util'
import type { CMessageSlot } from '@/components/CMessages/CMessages'
import type { GenericProps } from '@/util'

export interface CInputSlot {
  id: ComputedRef<string>
  messagesId: ComputedRef<string>
  isDirty: ComputedRef<boolean>
  isDisabled: ComputedRef<boolean>
  isReadonly: ComputedRef<boolean>
  isPristine: Ref<boolean>
  isValid: ComputedRef<boolean | null>
  isValidating: Ref<boolean>
  reset: () => void
  resetValidation: () => void
  validate: () => void
}

export const makeCInputProps = propsFactory({
  'id': String,
  'appendIcon': IconValue,
  'centerAffix': {
    type: Boolean,
    default: true,
  },
  'prependIcon': IconValue,
  'hideDetails': [Boolean, String] as PropType<boolean | 'auto'>,
  'hideSpinButtons': Boolean,
  'hint': String,
  'persistentHint': Boolean,
  'messages': {
    type: [Array, String] as PropType<string | readonly string[]>,
    default: () => ([]),
  },
  'direction': {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
    validator: (v: any) => ['horizontal', 'vertical'].includes(v),
  },

  'onClick:prepend': EventProp<[MouseEvent]>(),
  'onClick:append': EventProp<[MouseEvent]>(),

  ...makeComponentProps(),
  ...makeDensityProps(),
  ...only(makeDimensionProps(), [
    'maxWidth',
    'minWidth',
    'width',
  ]),
  ...makeThemeProps(),
  ...makeValidationProps(),
}, 'CInput')

export type CInputSlots = {
  default: CInputSlot
  prepend: CInputSlot
  append: CInputSlot
  details: CInputSlot
  message: CMessageSlot
}

export const CInput = genericComponent<new<T>(
  props: {
    'modelValue'?: T | null
    'onUpdate:modelValue'?: (value: T | null) => void
  },
  slots: CInputSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CInput',

  props: {
    ...makeCInputProps(),
  },

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { themeClasses } = provideTheme(props)
    const { rtlClasses } = useRtl()
    const { InputIcon } = useInputIcon(props)

    const uid = getUid()
    const id = computed(() => props.id || `input-${uid}`)
    const messagesId = computed(() => `${id.value}-messages`)

    const {
      errorMessages,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate,
      validationClasses,
    } = useValidation(props, 'v-input', id)

    const slotProps = computed<CInputSlot>(() => ({
      id,
      messagesId,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate,
    }))

    const messages = computed(() => {
      if (props.errorMessages?.length || (!isPristine.value && errorMessages.value.length))
        return errorMessages.value
      else if (props.hint && (props.persistentHint || props.focused))
        return props.hint
      else
        return props.messages
    })

    useRender(() => {
      const hasPrepend = !!(slots.prepend || props.prependIcon)
      const hasAppend = !!(slots.append || props.appendIcon)
      const hasMessages = messages.value.length > 0
      const hasDetails = !props.hideDetails || (
        props.hideDetails === 'auto'
        && (hasMessages || !!slots.details)
      )

      return (
        <div
          class={[
            'v-input',
            `v-input--${props.direction}`,
            {
              'v-input--center-affix': props.centerAffix,
              'v-input--hide-spin-buttons': props.hideSpinButtons,
            },
            densityClasses.value,
            themeClasses.value,
            rtlClasses.value,
            validationClasses.value,
            props.class,
          ]}
          style={[
            dimensionStyles.value,
            props.style,
          ]}
        >
          { hasPrepend && (
            <div key="prepend" class="v-input__prepend">
              { slots.prepend?.(slotProps.value) }

              { props.prependIcon && (
                <InputIcon
                  key="prepend-icon"
                  name="prepend"
                />
              )}
            </div>
          )}

          { slots.default && (
            <div class="v-input__control">
              { slots.default?.(slotProps.value) }
            </div>
          )}

          { hasAppend && (
            <div key="append" class="v-input__append">
              { props.appendIcon && (
                <InputIcon
                  key="append-icon"
                  name="append"
                />
              )}

              { slots.append?.(slotProps.value) }
            </div>
          )}

          { hasDetails && (
            <div class="v-input__details">
              <CMessages
                id={messagesId.value}
                active={hasMessages}
                messages={messages.value}
                v-slots={{ message: slots.message }}
              />

              { slots.details?.(slotProps.value) }
            </div>
          )}
        </div>
      )
    })

    return {
      reset,
      resetValidation,
      validate,
      isValid,
      errorMessages,
    }
  },
})

export type CInput = InstanceType<typeof CInput>
