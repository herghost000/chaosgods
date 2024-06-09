import './CBanner.sass'
import { toRef } from 'vue'
import type { PropType } from 'vue'
import { CBannerActions } from './CBannerActions'
import { CBannerText } from './CBannerText'
import { CAvatar } from '@/components/CAvatar'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { makeBorderProps, useBorder } from '@/composables/border'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeDisplayProps, useDisplay } from '@/composables/display'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { IconValue } from '@/composables/icons'
import { makeLocationProps, useLocation } from '@/composables/location'
import { makePositionProps, usePosition } from '@/composables/position'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genericComponent, propsFactory, useRender } from '@/util'

export type CBannerSlots = {
  default: never
  prepend: never
  text: never
  actions: never
}

export const makeCBannerProps = propsFactory({
  avatar: String,
  bgColor: String,
  color: String,
  icon: IconValue,
  lines: String as PropType<'one' | 'two' | 'three'>,
  stacked: Boolean,
  sticky: Boolean,
  text: String,

  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeDisplayProps({ mobile: null }),
  ...makeElevationProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
}, 'CBanner')

export const CBanner = genericComponent<CBannerSlots>()({
  name: 'CBanner',

  props: makeCBannerProps(),

  setup(props, { slots }) {
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
    const { borderClasses } = useBorder(props)
    const { densityClasses } = useDensity(props)
    const { displayClasses, mobile } = useDisplay(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { locationStyles } = useLocation(props)
    const { positionClasses } = usePosition(props)
    const { roundedClasses } = useRounded(props)

    const { themeClasses } = provideTheme(props)

    const color = toRef(props, 'color')
    const density = toRef(props, 'density')

    provideDefaults({ CBannerActions: { color, density } })

    useRender(() => {
      const hasText = !!(props.text || slots.text)
      const hasPrependMedia = !!(props.avatar || props.icon)
      const hasPrepend = !!(hasPrependMedia || slots.prepend)

      return (
        <props.tag
          class={[
            'v-banner',
            {
              'v-banner--stacked': props.stacked || mobile.value,
              'v-banner--sticky': props.sticky,
              [`v-banner--${props.lines}-line`]: !!props.lines,
            },
            themeClasses.value,
            backgroundColorClasses.value,
            borderClasses.value,
            densityClasses.value,
            displayClasses.value,
            elevationClasses.value,
            positionClasses.value,
            roundedClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            dimensionStyles.value,
            locationStyles.value,
            props.style,
          ]}
          role="banner"
        >
          { hasPrepend && (
            <div key="prepend" class="v-banner__prepend">
              { !slots.prepend
                ? (
                  <CAvatar
                    key="prepend-avatar"
                    color={color.value}
                    density={density.value}
                    icon={props.icon}
                    image={props.avatar}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="prepend-defaults"
                    disabled={!hasPrependMedia}
                    defaults={{
                      CAvatar: {
                        color: color.value,
                        density: density.value,
                        icon: props.icon,
                        image: props.avatar,
                      },
                    }}
                    v-slots:default={slots.prepend}
                  />
                  )}
            </div>
          )}

          <div class="v-banner__content">
            { hasText && (
              <CBannerText key="text">
                { slots.text?.() ?? props.text }
              </CBannerText>
            )}

            { slots.default?.() }
          </div>

          { slots.actions && (
            <CBannerActions key="actions" v-slots:default={slots.actions} />
          )}
        </props.tag>
      )
    })
  },
})

export type CBanner = InstanceType<typeof CBanner>
