import './CProgressLinear.sass'
import { Transition, computed } from 'vue'
import { useBackgroundColor, useTextColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { useIntersectionObserver } from '@/composables/intersectionObserver'
import { useRtl } from '@/composables/locale'
import { makeLocationProps, useLocation } from '@/composables/location'
import { useProxiedModel } from '@/composables/proxiedModel'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { clamp, convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

type CProgressLinearSlots = {
  default: { value: number, buffer: number }
}

export const makeCProgressLinearProps = propsFactory({
  absolute: Boolean,
  active: {
    type: Boolean,
    default: true,
  },
  bgColor: String,
  bgOpacity: [Number, String],
  bufferValue: {
    type: [Number, String],
    default: 0,
  },
  bufferColor: String,
  bufferOpacity: [Number, String],
  clickable: Boolean,
  color: String,
  height: {
    type: [Number, String],
    default: 4,
  },
  indeterminate: Boolean,
  max: {
    type: [Number, String],
    default: 100,
  },
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  opacity: [Number, String],
  reverse: Boolean,
  stream: Boolean,
  striped: Boolean,
  roundedBar: Boolean,

  ...makeComponentProps(),
  ...makeLocationProps({ location: 'top' } as const),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
}, 'CProgressLinear')

export const CProgressLinear = genericComponent<CProgressLinearSlots>()({
  name: 'CProgressLinear',

  props: makeCProgressLinearProps(),

  emits: {
    'update:modelValue': (_value: number) => true,
  },

  setup(props, { slots }) {
    const progress = useProxiedModel(props, 'modelValue')
    const { isRtl, rtlClasses } = useRtl()
    const { themeClasses } = provideTheme(props)
    const { locationStyles } = useLocation(props)
    const { textColorClasses, textColorStyles } = useTextColor(props, 'color')
    const {
      backgroundColorClasses,
      backgroundColorStyles,
    } = useBackgroundColor(computed(() => props.bgColor || props.color))
    const {
      backgroundColorClasses: bufferColorClasses,
      backgroundColorStyles: bufferColorStyles,
    } = useBackgroundColor(computed(() => props.bufferColor || props.bgColor || props.color))
    const {
      backgroundColorClasses: barColorClasses,
      backgroundColorStyles: barColorStyles,
    } = useBackgroundColor(props, 'color')
    const { roundedClasses } = useRounded(props)
    const { intersectionRef, isIntersecting } = useIntersectionObserver()

    const max = computed(() => Number.parseFloat(`${props.max}`))
    const height = computed(() => Number.parseFloat(`${props.height}`))
    const normalizedBuffer = computed(() => clamp(Number.parseFloat(`${props.bufferValue}`) / max.value * 100, 0, 100))
    const normalizedValue = computed(() => clamp(Number.parseFloat(`${progress.value}`) / max.value * 100, 0, 100))
    const isReversed = computed(() => isRtl.value !== props.reverse)
    const transition = computed(() => props.indeterminate ? 'fade-transition' : 'slide-x-transition')

    function handleClick(e: MouseEvent) {
      if (!intersectionRef.value)
        return

      const { left, right, width } = intersectionRef.value.getBoundingClientRect()
      const value = isReversed.value ? (width - e.clientX) + (right - width) : e.clientX - left

      progress.value = Math.round(value / width * max.value)
    }

    useRender(() => (
      <props.tag
        ref={intersectionRef}
        class={[
          'v-progress-linear',
          {
            'v-progress-linear--absolute': props.absolute,
            'v-progress-linear--active': props.active && isIntersecting.value,
            'v-progress-linear--reverse': isReversed.value,
            'v-progress-linear--rounded': props.rounded,
            'v-progress-linear--rounded-bar': props.roundedBar,
            'v-progress-linear--striped': props.striped,
          },
          roundedClasses.value,
          themeClasses.value,
          rtlClasses.value,
          props.class,
        ]}
        style={[
          {
            'bottom': props.location === 'bottom' ? 0 : undefined,
            'top': props.location === 'top' ? 0 : undefined,
            'height': props.active ? convertToUnit(height.value) : 0,
            '--v-progress-linear-height': convertToUnit(height.value),
            ...(props.absolute ? locationStyles.value : {}),
          },
          props.style,
        ]}
        role="progressbar"
        aria-hidden={props.active ? 'false' : 'true'}
        aria-valuemin="0"
        aria-valuemax={props.max}
        aria-valuenow={props.indeterminate ? undefined : normalizedValue.value}
        onClick={props.clickable && handleClick}
      >
        { props.stream && (
          <div
            key="stream"
            class={[
              'v-progress-linear__stream',
              textColorClasses.value,
            ]}
            style={{
              ...textColorStyles.value,
              [isReversed.value ? 'left' : 'right']: convertToUnit(-height.value),
              'borderTop': `${convertToUnit(height.value / 2)} dotted`,
              'opacity': Number.parseFloat(`${props.bufferOpacity!}`),
              'top': `calc(50% - ${convertToUnit(height.value / 4)})`,
              'width': convertToUnit(100 - normalizedBuffer.value, '%'),
              '--v-progress-linear-stream-to': convertToUnit(height.value * (isReversed.value ? 1 : -1)),
            }}
          />
        )}

        <div
          class={[
            'v-progress-linear__background',
            backgroundColorClasses.value,
          ]}
          style={[
            backgroundColorStyles.value,
            {
              opacity: Number.parseFloat(`${props.bgOpacity!}`),
              width: props.stream ? 0 : undefined,
            },
          ]}
        />

        <div
          class={[
            'v-progress-linear__buffer',
            bufferColorClasses.value,
          ]}
          style={[
            bufferColorStyles.value,
            {
              opacity: Number.parseFloat(`${props.bufferOpacity!}`),
              width: convertToUnit(normalizedBuffer.value, '%'),
            },
          ]}
        />

        <Transition name={transition.value}>
          { !props.indeterminate
            ? (
              <div
                class={[
                  'v-progress-linear__determinate',
                  barColorClasses.value,
                ]}
                style={[
                  barColorStyles.value,
                  { width: convertToUnit(normalizedValue.value, '%') },
                ]}
              />
              )
            : (
              <div class="v-progress-linear__indeterminate">
                {['long', 'short'].map(bar => (
                  <div
                    key={bar}
                    class={[
                      'v-progress-linear__indeterminate',
                      bar,
                      barColorClasses.value,
                    ]}
                    style={barColorStyles.value}
                  />
                ))}
              </div>
              )}
        </Transition>

        { slots.default && (
          <div class="v-progress-linear__content">
            { slots.default({ value: normalizedValue.value, buffer: normalizedBuffer.value }) }
          </div>
        )}
      </props.tag>
    ))

    return {}
  },
})

export type CProgressLinear = InstanceType<typeof CProgressLinear>
