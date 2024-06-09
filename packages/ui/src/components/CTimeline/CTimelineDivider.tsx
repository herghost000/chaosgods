import { toRef } from 'vue'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { IconValue } from '@/composables/icons'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeSizeProps, useSize } from '@/composables/size'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCTimelineDividerProps = propsFactory({
  dotColor: String,
  fillDot: Boolean,
  hideDot: Boolean,
  icon: IconValue,
  iconColor: String,
  lineColor: String,

  ...makeComponentProps(),
  ...makeRoundedProps(),
  ...makeSizeProps(),
  ...makeElevationProps(),
}, 'CTimelineDivider')

export const CTimelineDivider = genericComponent()({
  name: 'CTimelineDivider',

  props: makeCTimelineDividerProps(),

  setup(props, { slots }) {
    const { sizeClasses, sizeStyles } = useSize(props, 'v-timeline-divider__dot')
    const { backgroundColorStyles, backgroundColorClasses } = useBackgroundColor(toRef(props, 'dotColor'))
    const { roundedClasses } = useRounded(props, 'v-timeline-divider__dot')
    const { elevationClasses } = useElevation(props)
    const {
      backgroundColorClasses: lineColorClasses,
      backgroundColorStyles: lineColorStyles,
    } = useBackgroundColor(toRef(props, 'lineColor'))

    useRender(() => (
      <div
        class={[
          'v-timeline-divider',
          {
            'v-timeline-divider--fill-dot': props.fillDot,
          },
          props.class,
        ]}
        style={props.style}
      >
        <div
          class={[
            'v-timeline-divider__before',
            lineColorClasses.value,
          ]}
          style={lineColorStyles.value}
        />

        { !props.hideDot && (
          <div
            key="dot"
            class={[
              'v-timeline-divider__dot',
              elevationClasses.value,
              roundedClasses.value,
              sizeClasses.value,
            ]}
            style={sizeStyles.value}
          >
            <div
              class={[
                'v-timeline-divider__inner-dot',
                backgroundColorClasses.value,
                roundedClasses.value,
              ]}
              style={backgroundColorStyles.value}
            >
              { !slots.default
                ? (
                  <CIcon
                    key="icon"
                    color={props.iconColor}
                    icon={props.icon}
                    size={props.size}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="icon-defaults"
                    disabled={!props.icon}
                    defaults={{
                      CIcon: {
                        color: props.iconColor,
                        icon: props.icon,
                        size: props.size,
                      },
                    }}
                    v-slots:default={slots.default}
                  />
                  )}
            </div>
          </div>
        )}

        <div
          class={[
            'v-timeline-divider__after',
            lineColorClasses.value,
          ]}
          style={lineColorStyles.value}
        />
      </div>
    ))

    return {}
  },
})

export type CTimelineDivider = InstanceType<typeof CTimelineDivider>
