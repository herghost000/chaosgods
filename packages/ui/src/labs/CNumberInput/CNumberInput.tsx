import './CNumberInput.sass'
import { computed, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { CBtn } from '../../components/CBtn'
import { CDefaultsProvider } from '../../components/CDefaultsProvider'
import { CDivider } from '../../components/CDivider'
import { CTextField, makeCTextFieldProps } from '@/components/CTextField/CTextField'
import { useProxiedModel } from '@/composables/proxiedModel'
import { clamp, genericComponent, getDecimals, omit, propsFactory, useRender } from '@/util'
import type { CTextFieldSlots } from '@/components/CTextField/CTextField'

type ControlSlot = {
  click: (e: MouseEvent) => void
}

type CNumberInputSlots = Omit<CTextFieldSlots, 'default'> & {
  increment: ControlSlot
  decrement: ControlSlot
}

type ControlVariant = 'default' | 'stacked' | 'split'

const makeCNumberInputProps = propsFactory({
  controlVariant: {
    type: String as PropType<ControlVariant>,
    default: 'default',
  },
  inset: Boolean,
  hideInput: Boolean,
  min: {
    type: Number,
    default: Number.NEGATIVE_INFINITY,
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
  },
  step: {
    type: Number,
    default: 1,
  },

  ...omit(makeCTextFieldProps(), ['appendInnerIcon', 'prependInnerIcon']),
}, 'CNumberInput')

export const CNumberInput = genericComponent<CNumberInputSlots>()({
  name: 'CNumberInput',

  inheritAttrs: false,

  props: {
    ...makeCNumberInputProps(),
  },

  emits: {
    'update:modelValue': (_val: number) => true,
  },

  setup(props, { slots }) {
    const model = useProxiedModel(props, 'modelValue')

    const stepDecimals = computed(() => getDecimals(props.step))
    const modelDecimals = computed(() => model.value != null ? getDecimals(model.value) : 0)

    const canIncrease = computed(() => {
      if (model.value == null)
        return true
      return model.value + props.step <= props.max
    })
    const canDecrease = computed(() => {
      if (model.value == null)
        return true
      return model.value - props.step >= props.min
    })

    watchEffect(() => {
      if (model.value != null && (model.value < props.min || model.value > props.max))
        model.value = clamp(model.value, props.min, props.max)
    })

    const controlVariant = computed(() => {
      return props.hideInput ? 'stacked' : props.controlVariant
    })

    const incrementSlotProps = computed(() => ({ click: onClickUp }))

    const decrementSlotProps = computed(() => ({ click: onClickDown }))

    function toggleUpDown(increment = true) {
      if (model.value == null) {
        model.value = 0
        return
      }

      const decimals = Math.max(modelDecimals.value, stepDecimals.value)
      if (increment) {
        if (canIncrease.value)
          model.value = +(((model.value + props.step).toFixed(decimals)))
      }
      else {
        if (canDecrease.value)
          model.value = +(((model.value - props.step).toFixed(decimals)))
      }
    }

    function onClickUp(e: MouseEvent) {
      e.stopPropagation()
      toggleUpDown()
    }

    function onClickDown(e: MouseEvent) {
      e.stopPropagation()
      toggleUpDown(false)
    }

    function onKeydown(e: KeyboardEvent) {
      if (
        ['Enter', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab'].includes(e.key)
        || e.ctrlKey
      ) return

      if (['ArrowDown'].includes(e.key)) {
        e.preventDefault()
        toggleUpDown(false)
        return
      }
      if (['ArrowUp'].includes(e.key)) {
        e.preventDefault()
        toggleUpDown()
        return
      }

      // Only numbers, +, - & . are allowed
      if (!/^[0-9\-+.]+$/.test(e.key))
        e.preventDefault()
    }

    function onModelUpdate(v: string) {
      model.value = v ? +(v) : undefined
    }

    function onControlMousedown(e: MouseEvent) {
      e.stopPropagation()
    }

    useRender(() => {
      const { modelValue: _, ...textFieldProps } = CTextField.filterProps(props)

      function controlNode() {
        const defaultHeight = controlVariant.value === 'stacked' ? 'auto' : '100%'
        return (
          <div class="v-number-input__control">
            {
              !slots.decrement
                ? (
                  <CBtn
                    disabled={!canDecrease.value}
                    flat
                    key="decrement-btn"
                    height={defaultHeight}
                    name="decrement-btn"
                    icon="$expand"
                    size="small"
                    tabindex="-1"
                    onClick={onClickDown}
                    onMousedown={onControlMousedown}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="decrement-defaults"
                    defaults={{
                      CBtn: {
                        disabled: !canDecrease.value,
                        flat: true,
                        height: defaultHeight,
                        size: 'small',
                        icon: '$expand',
                      },
                    }}
                  >
                    { slots.decrement(decrementSlotProps.value) }
                  </CDefaultsProvider>
                  )
            }

            <CDivider
              vertical={controlVariant.value !== 'stacked'}
            />

            {
              !slots.increment
                ? (
                  <CBtn
                    disabled={!canIncrease.value}
                    flat
                    key="increment-btn"
                    height={defaultHeight}
                    name="increment-btn"
                    icon="$collapse"
                    onClick={onClickUp}
                    onMousedown={onControlMousedown}
                    size="small"
                    tabindex="-1"
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="increment-defaults"
                    defaults={{
                      CBtn: {
                        disabled: !canIncrease.value,
                        flat: true,
                        height: defaultHeight,
                        size: 'small',
                        icon: '$collapse',
                      },
                    }}
                  >
                    { slots.increment(incrementSlotProps.value) }
                  </CDefaultsProvider>
                  )
            }
          </div>
        )
      }

      function dividerNode() {
        return !props.hideInput && !props.inset ? <CDivider vertical /> : undefined
      }

      const appendInnerControl
        = controlVariant.value === 'split'
          ? (
            <div class="v-number-input__control">
              <CDivider vertical />

              <CBtn
                flat
                height="100%"
                icon="$plus"
                tile
                tabindex="-1"
                onClick={onClickUp}
                onMousedown={onControlMousedown}
              />
            </div>
            )
          : (!props.reverse
              ? (
                <>
                  { dividerNode() }
                  { controlNode() }
                </>
                )
              : undefined)

      const hasAppendInner = slots['append-inner'] || appendInnerControl

      const prependInnerControl
        = controlVariant.value === 'split'
          ? (
            <div class="v-number-input__control">
              <CBtn
                flat
                height="100%"
                icon="$minus"
                tile
                tabindex="-1"
                onClick={onClickDown}
                onMousedown={onControlMousedown}
              />

              <CDivider vertical />
            </div>
            )
          : (props.reverse
              ? (
                <>
                  { controlNode() }
                  { dividerNode() }
                </>
                )
              : undefined)

      const hasPrependInner = slots['prepend-inner'] || prependInnerControl

      return (
        <CTextField
          modelValue={model.value}
          onUpdate:modelValue={onModelUpdate}
          onKeydown={onKeydown}
          class={[
            'v-number-input',
            {
              'v-number-input--default': controlVariant.value === 'default',
              'v-number-input--hide-input': props.hideInput,
              'v-number-input--inset': props.inset,
              'v-number-input--reverse': props.reverse,
              'v-number-input--split': controlVariant.value === 'split',
              'v-number-input--stacked': controlVariant.value === 'stacked',
            },
            props.class,
          ]}
          {...textFieldProps}
          style={props.style}
          inputmode="decimal"
        >
          {{
            ...slots,
            'append-inner': hasAppendInner
              ? (...args) => (
                <>
                  { slots['append-inner']?.(...args) }
                  { appendInnerControl }
                </>
                )
              : undefined,
            'prepend-inner': hasPrependInner
              ? (...args) => (
                <>
                  { prependInnerControl }
                  { slots['prepend-inner']?.(...args) }
                </>
                )
              : undefined,
          }}
        </CTextField>
      )
    })
  },
})

export type CNumberInput = InstanceType<typeof CNumberInput>
