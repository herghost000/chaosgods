import './CStepperItem.sass'
import { computed } from 'vue'
import type { PropType } from 'vue'
import { CStepperSymbol } from './CStepper'
import { CAvatar } from '@/components/CAvatar/CAvatar'
import { CIcon } from '@/components/CIcon/CIcon'
import { makeGroupItemProps, useGroupItem } from '@/composables/group'
import { genOverlays } from '@/composables/variant'
import { Ripple } from '@/directives/ripple'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { RippleDirectiveBinding } from '@/directives/ripple'

export type StepperItem = string | Record<string, any>

export type StepperItemSlot = {
  canEdit: boolean
  hasError: boolean
  hasCompleted: boolean
  title?: string | number
  subtitle?: string | number
  step: any
}

export type CStepperItemSlots = {
  default: StepperItemSlot
  icon: StepperItemSlot
  title: StepperItemSlot
  subtitle: StepperItemSlot
}

export type ValidationRule = () => string | boolean

export const makeStepperItemProps = propsFactory({
  color: String,
  title: String,
  subtitle: String,
  complete: Boolean,
  completeIcon: {
    type: String,
    default: '$complete',
  },
  editable: Boolean,
  editIcon: {
    type: String,
    default: '$edit',
  },
  error: Boolean,
  errorIcon: {
    type: String,
    default: '$error',
  },
  icon: String,
  ripple: {
    type: [Boolean, Object] as PropType<RippleDirectiveBinding['value']>,
    default: true,
  },
  rules: {
    type: Array as PropType<readonly ValidationRule[]>,
    default: () => ([]),
  },
}, 'StepperItem')

export const makeCStepperItemProps = propsFactory({
  ...makeStepperItemProps(),
  ...makeGroupItemProps(),
}, 'CStepperItem')

export const CStepperItem = genericComponent<CStepperItemSlots>()({
  name: 'CStepperItem',

  directives: { Ripple },

  props: makeCStepperItemProps(),

  emits: {
    'group:selected': (_val: { value: boolean }) => true,
  },

  setup(props, { slots }) {
    const group = useGroupItem(props, CStepperSymbol, true)
    const step = computed(() => group?.value.value ?? props.value)
    const isValid = computed(() => props.rules.every(handler => handler() === true))
    const isClickable = computed(() => !props.disabled && props.editable)
    const canEdit = computed(() => !props.disabled && props.editable)
    const hasError = computed(() => props.error || !isValid.value)
    const hasCompleted = computed(() => props.complete || (props.rules.length > 0 && isValid.value))
    const icon = computed(() => {
      if (hasError.value)
        return props.errorIcon
      if (hasCompleted.value)
        return props.completeIcon
      if (group.isSelected.value && props.editable)
        return props.editIcon

      return props.icon
    })
    const slotProps = computed(() => ({
      canEdit: canEdit.value,
      hasError: hasError.value,
      hasCompleted: hasCompleted.value,
      title: props.title,
      subtitle: props.subtitle,
      step: step.value,
      value: props.value,
    }))

    useRender(() => {
      const hasColor = (
        !group
        || group.isSelected.value
        || hasCompleted.value
        || canEdit.value
      ) && (
        !hasError.value
        && !props.disabled
      )
      const hasTitle = !!(props.title != null || slots.title)
      const hasSubtitle = !!(props.subtitle != null || slots.subtitle)

      function onClick() {
        group?.toggle()
      }

      return (
        <button
          class={[
            'v-stepper-item',
            {
              'v-stepper-item--complete': hasCompleted.value,
              'v-stepper-item--disabled': props.disabled,
              'v-stepper-item--error': hasError.value,
            },
            group?.selectedClass.value,
          ]}
          disabled={!props.editable}
          v-ripple={[
            props.ripple && props.editable,
            null,
            null,
          ]}
          onClick={onClick}
        >
          { isClickable.value && genOverlays(true, 'v-stepper-item') }

          <CAvatar
            key="stepper-avatar"
            class="v-stepper-item__avatar"
            color={hasColor ? props.color : undefined}
            size={24}
          >
            { slots.icon?.(slotProps.value) ?? (
              icon.value
                ? (
                  <CIcon icon={icon.value}></CIcon>
                  )
                : step.value
            )}
          </CAvatar>

          <div class="v-stepper-item__content">
            { hasTitle && (
              <div
                key="title"
                class="v-stepper-item__title"
              >
                { slots.title?.(slotProps.value) ?? props.title }
              </div>
            )}

            { hasSubtitle && (
              <div
                key="subtitle"
                class="v-stepper-item__subtitle"
              >
                { slots.subtitle?.(slotProps.value) ?? props.subtitle }
              </div>
            )}

            { slots.default?.(slotProps.value) }
          </div>
        </button>
      )
    })
    return {}
  },
})

export type CStepperItem = InstanceType<typeof CStepperItem>
