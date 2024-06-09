import './CStepperVerticalItem.sass'
import { computed, ref } from 'vue'
import { CStepperVerticalActions } from './CStepperVerticalActions'
import { CAvatar } from '@/components/CAvatar/CAvatar'
import { CDefaultsProvider } from '@/components/CDefaultsProvider/CDefaultsProvider'
import { CExpansionPanel } from '@/components/CExpansionPanel'
import { makeCExpansionPanelProps } from '@/components/CExpansionPanel/CExpansionPanel'
import { CIcon } from '@/components/CIcon/CIcon'
import { makeStepperItemProps } from '@/components/CStepper/CStepperItem'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { StepperItemSlot } from '@/components/CStepper/CStepperItem'

export type CStepperVerticalItemSlots = {
  default: StepperItemSlot
  icon: StepperItemSlot
  subtitle: StepperItemSlot
  title: StepperItemSlot
  text: StepperItemSlot
  prev: StepperItemSlot
  next: StepperItemSlot
  actions: StepperItemSlot & {
    next: () => void
    prev: () => void
  }
}

export const makeCStepperVerticalItemProps = propsFactory({
  hideActions: Boolean,

  ...makeStepperItemProps(),
  ...omit(makeCExpansionPanelProps({
    expandIcon: '',
    collapseIcon: '',
  }), ['hideActions']),
}, 'CStepperVerticalItem')

export const CStepperVerticalItem = genericComponent<CStepperVerticalItemSlots>()({
  name: 'CStepperVerticalItem',

  props: makeCStepperVerticalItemProps(),

  emits: {
    'click:next': () => true,
    'click:prev': () => true,
    'click:finish': () => true,
  },

  setup(props, { emit, slots }) {
    const vExpansionPanelRef = ref<typeof CExpansionPanel>()
    const step = computed(() => !Number.isNaN(Number.parseInt(props.value)) ? Number(props.value) : props.value)
    const groupItem = computed(() => vExpansionPanelRef.value?.groupItem)
    const isSelected = computed(() => groupItem.value?.isSelected.value ?? false)
    const isValid = computed(() => isSelected.value ? props.rules.every(handler => handler() === true) : null)
    const canEdit = computed(() => !props.disabled && props.editable)
    const hasError = computed(() => props.error || (isSelected.value && !isValid.value))
    const hasCompleted = computed(() => props.complete || (props.rules.length > 0 && isValid.value === true))

    const disabled = computed(() => {
      if (props.disabled)
        return props.disabled
      if (groupItem.value?.isFirst.value)
        return 'prev'

      return false
    })
    const icon = computed(() => {
      if (hasError.value)
        return props.errorIcon
      if (hasCompleted.value)
        return props.completeIcon
      if (groupItem.value?.isSelected.value && props.editable)
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

    const actionProps = computed(() => ({
      ...slotProps.value,
      prev: onClickPrev,
      next: onClickNext,
    }))

    function onClickNext() {
      emit('click:next')

      if (groupItem.value?.isLast.value)
        return

      groupItem.value.group.next()
    }

    function onClickPrev() {
      emit('click:prev')

      groupItem.value.group.prev()
    }

    useRender(() => {
      const hasColor = (
        hasCompleted.value
        || groupItem.value?.isSelected.value
      ) && (
        !hasError.value
        && !props.disabled
      )

      const hasActions = !props.hideActions || !!slots.actions
      const expansionPanelProps = CExpansionPanel.filterProps(props)

      return (
        <CExpansionPanel
          _as="CStepperVerticalItem"
          ref={vExpansionPanelRef}
          {...expansionPanelProps}
          class={[
            'v-stepper-vertical-item',
            {
              'v-stepper-vertical-item--complete': hasCompleted.value,
              'v-stepper-vertical-item--disabled': props.disabled,
              'v-stepper-vertical-item--editable': canEdit.value,
              'v-stepper-vertical-item--error': hasError.value,
            },
            props.class,
          ]}
          readonly={!props.editable}
          style={props.style}
          color=""
          hide-actions={false}
          value={step.value}
        >
          {{
            title: () => (
              <>
                <CAvatar
                  key="stepper-avatar"
                  class="v-stepper-vertical-item__avatar"
                  color={hasColor ? props.color : undefined}
                  size={24}
                  start
                >
                  { slots.icon?.(slotProps.value) ?? (
                    icon.value
                      ? (
                        <CIcon icon={icon.value}></CIcon>
                        )
                      : step.value
                  )}
                </CAvatar>

                <div>
                  <div class="v-stepper-vertical-item__title">
                    { slots.title?.(slotProps.value) ?? props.title }
                  </div>

                  <div class="v-stepper-vertical-item__subtitle">
                    { slots.subtitle?.(slotProps.value) ?? props.subtitle }
                  </div>
                </div>
              </>
            ),
            text: () => (
              <>
                { slots.default?.(slotProps.value) ?? props.text }

                { hasActions && (
                  <CDefaultsProvider
                    defaults={{
                      CStepperVerticalActions: {
                        disabled: disabled.value,
                        finish: groupItem.value?.isLast.value,
                      },
                    }}
                  >
                    { slots.actions?.(actionProps.value) ?? (
                      <CStepperVerticalActions
                        onClick:next={onClickNext}
                        onClick:prev={onClickPrev}
                        v-slots={{
                          prev: slots.prev ? () => slots.prev?.(actionProps.value) : undefined,
                          next: slots.next ? () => slots.next?.(actionProps.value) : undefined,
                        }}
                      />
                    )}
                  </CDefaultsProvider>
                )}
              </>
            ),
          }}
        </CExpansionPanel>
      )
    })

    return {}
  },
})

export type CStepperVerticalItem = InstanceType<typeof CStepperVerticalItem>
