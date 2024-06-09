import './CSliderTrack.sass'
import { computed, inject } from 'vue'
import { CSliderSymbol } from './slider'
import type { Tick } from './slider'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { useRounded } from '@/composables/rounded'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

export type CSliderTrackSlots = {
  'tick-label': { tick: Tick, index: number }
}

export const makeCSliderTrackProps = propsFactory({
  start: {
    type: Number,
    required: true,
  },
  stop: {
    type: Number,
    required: true,
  },

  ...makeComponentProps(),
}, 'CSliderTrack')

export const CSliderTrack = genericComponent<CSliderTrackSlots>()({
  name: 'CSliderTrack',

  props: makeCSliderTrackProps(),

  emits: {},

  setup(props, { slots }) {
    const slider = inject(CSliderSymbol)

    if (!slider)
      throw new Error('[Vuetify] v-slider-track must be inside v-slider or v-range-slider')

    const {
      color,
      parsedTicks,
      rounded,
      showTicks,
      tickSize,
      trackColor,
      trackFillColor,
      trackSize,
      vertical,
      min,
      max,
      indexFromEnd,
    } = slider

    const { roundedClasses } = useRounded(rounded)

    const {
      backgroundColorClasses: trackFillColorClasses,
      backgroundColorStyles: trackFillColorStyles,
    } = useBackgroundColor(trackFillColor)

    const {
      backgroundColorClasses: trackColorClasses,
      backgroundColorStyles: trackColorStyles,
    } = useBackgroundColor(trackColor)

    const startDir = computed(() => `inset-${vertical.value ? 'block' : 'inline'}-${indexFromEnd.value ? 'end' : 'start'}`)
    const endDir = computed(() => vertical.value ? 'height' : 'width')

    const backgroundStyles = computed(() => {
      return {
        [startDir.value]: '0%',
        [endDir.value]: '100%',
      }
    })

    const trackFillWidth = computed(() => props.stop - props.start)

    const trackFillStyles = computed(() => {
      return {
        [startDir.value]: convertToUnit(props.start, '%'),
        [endDir.value]: convertToUnit(trackFillWidth.value, '%'),
      }
    })

    const computedTicks = computed(() => {
      if (!showTicks.value)
        return []

      const ticks = vertical.value ? parsedTicks.value.slice().reverse() : parsedTicks.value

      return ticks.map((tick, index) => {
        const directionValue = tick.value !== min.value && tick.value !== max.value ? convertToUnit(tick.position, '%') : undefined

        return (
          <div
            key={tick.value}
            class={[
              'v-slider-track__tick',
              {
                'v-slider-track__tick--filled': tick.position >= props.start && tick.position <= props.stop,
                'v-slider-track__tick--first': tick.value === min.value,
                'v-slider-track__tick--last': tick.value === max.value,
              },
            ]}
            style={{ [startDir.value]: directionValue }}
          >
            {
              (tick.label || slots['tick-label']) && (
                <div class="v-slider-track__tick-label">
                  { slots['tick-label']?.({ tick, index }) ?? tick.label }
                </div>
              )
            }
          </div>
        )
      })
    })

    useRender(() => {
      return (
        <div
          class={[
            'v-slider-track',
            roundedClasses.value,
            props.class,
          ]}
          style={[
            {
              '--v-slider-track-size': convertToUnit(trackSize.value),
              '--v-slider-tick-size': convertToUnit(tickSize.value),
            },
            props.style,
          ]}
        >
          <div
            class={[
              'v-slider-track__background',
              trackColorClasses.value,
              {
                'v-slider-track__background--opacity': !!color.value || !trackFillColor.value,
              },
            ]}
            style={{
              ...backgroundStyles.value,
              ...trackColorStyles.value,
            }}
          />
          <div
            class={[
              'v-slider-track__fill',
              trackFillColorClasses.value,
            ]}
            style={{
              ...trackFillStyles.value,
              ...trackFillColorStyles.value,
            }}
          />

          { showTicks.value && (
            <div
              class={[
                'v-slider-track__ticks',
                {
                  'v-slider-track__ticks--always-show': showTicks.value === 'always',
                },
              ]}
            >
              { computedTicks.value }
            </div>
          )}
        </div>
      )
    })

    return {}
  },
})

export type CSliderTrack = InstanceType<typeof CSliderTrack>
