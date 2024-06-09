import './CSlider.sass'
import { computed, ref } from 'vue'
import { CSliderThumb } from './CSliderThumb'
import { CSliderTrack } from './CSliderTrack'
import { makeSliderProps, useSlider, useSteps } from './slider'
import type { CSliderThumbSlots } from './CSliderThumb'
import type { CSliderTrackSlots } from './CSliderTrack'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { CLabel } from '@/components/CLabel'
import { makeFocusProps, useFocus } from '@/composables/focus'
import { useRtl } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CInputSlot, CInputSlots } from '@/components/CInput/CInput'

export type CSliderSlots = CInputSlots & CSliderThumbSlots & CSliderTrackSlots & {
  label: CInputSlot
}

export const makeCSliderProps = propsFactory({
  ...makeFocusProps(),
  ...makeSliderProps(),
  ...makeCInputProps(),

  modelValue: {
    type: [Number, String],
    default: 0,
  },
}, 'CSlider')

export const CSlider = genericComponent<CSliderSlots>()({
  name: 'CSlider',

  props: makeCSliderProps(),

  emits: {
    'update:focused': (_value: boolean) => true,
    'update:modelValue': (_v: number) => true,
    'start': (_value: number) => true,
    'end': (_value: number) => true,
  },

  setup(props, { slots, emit }) {
    const thumbContainerRef = ref()
    const { rtlClasses } = useRtl()

    const steps = useSteps(props)

    const model = useProxiedModel(
      props,
      'modelValue',
      undefined,
      (value) => {
        return steps.roundValue(value == null ? steps.min.value : value)
      },
    )

    const {
      min,
      max,
      mousePressed,
      roundValue,
      onSliderMousedown,
      onSliderTouchstart,
      trackContainerRef,
      position,
      hasLabels,
      readonly,
    } = useSlider({
      props,
      steps,
      onSliderStart: () => {
        emit('start', model.value)
      },
      onSliderEnd: ({ value }) => {
        const roundedValue = roundValue(value)
        model.value = roundedValue
        emit('end', roundedValue)
      },
      onSliderMove: ({ value }) => model.value = roundValue(value),
      getActiveThumb: () => thumbContainerRef.value?.$el,
    })

    const { isFocused, focus, blur } = useFocus(props)
    const trackStop = computed(() => position(model.value))

    useRender(() => {
      const inputProps = CInput.filterProps(props)
      const hasPrepend = !!(props.label || slots.label || slots.prepend)

      return (
        <CInput
          class={[
            'v-slider',
            {
              'v-slider--has-labels': !!slots['tick-label'] || hasLabels.value,
              'v-slider--focused': isFocused.value,
              'v-slider--pressed': mousePressed.value,
              'v-slider--disabled': props.disabled,
            },
            rtlClasses.value,
            props.class,
          ]}
          style={props.style}
          {...inputProps}
          focused={isFocused.value}
        >
          {{
            ...slots,
            prepend: hasPrepend
              ? slotProps => (
                <>
                  { slots.label?.(slotProps) ?? (
                    props.label
                      ? (
                        <CLabel
                          id={slotProps.id.value}
                          class="v-slider__label"
                          text={props.label}
                        />
                        )
                      : undefined
                  )}

                  { slots.prepend?.(slotProps) }
                </>
              )
              : undefined,
            default: ({ id, messagesId }) => (
              <div
                class="v-slider__container"
                onMousedown={!readonly.value ? onSliderMousedown : undefined}
                onTouchstartPassive={!readonly.value ? onSliderTouchstart : undefined}
              >
                <input
                  id={id.value}
                  name={props.name || id.value}
                  disabled={!!props.disabled}
                  readonly={!!props.readonly}
                  tabindex="-1"
                  value={model.value}
                />

                <CSliderTrack
                  ref={trackContainerRef}
                  start={0}
                  stop={trackStop.value}
                >
                  {{ 'tick-label': slots['tick-label'] }}
                </CSliderTrack>

                <CSliderThumb
                  ref={thumbContainerRef}
                  aria-describedby={messagesId.value}
                  focused={isFocused.value}
                  min={min.value}
                  max={max.value}
                  modelValue={model.value}
                  onUpdate:modelValue={v => (model.value = v)}
                  position={trackStop.value}
                  elevation={props.elevation}
                  onFocus={focus}
                  onBlur={blur}
                  ripple={props.ripple}
                >
                  {{ 'thumb-label': slots['thumb-label'] }}
                </CSliderThumb>
              </div>
            ),
          }}
        </CInput>
      )
    })

    return {}
  },
})

export type CSlider = InstanceType<typeof CSlider>
