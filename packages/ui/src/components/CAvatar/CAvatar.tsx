import './CAvatar.sass'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { CImg } from '@/components/CImg'
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { IconValue } from '@/composables/icons'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeSizeProps, useSize } from '@/composables/size'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genOverlays, makeVariantProps, useVariant } from '@/composables/variant'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCAvatarProps = propsFactory({
  start: Boolean,
  end: Boolean,
  icon: IconValue,
  image: String,
  text: String,

  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeRoundedProps(),
  ...makeSizeProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'flat' } as const),
}, 'CAvatar')

export const CAvatar = genericComponent()({
  name: 'CAvatar',

  props: makeCAvatarProps(),

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)
    const { colorClasses, colorStyles, variantClasses } = useVariant(props)
    const { densityClasses } = useDensity(props)
    const { roundedClasses } = useRounded(props)
    const { sizeClasses, sizeStyles } = useSize(props)

    useRender(() => (
      <props.tag
        class={[
          'v-avatar',
          {
            'v-avatar--start': props.start,
            'v-avatar--end': props.end,
          },
          themeClasses.value,
          colorClasses.value,
          densityClasses.value,
          roundedClasses.value,
          sizeClasses.value,
          variantClasses.value,
          props.class,
        ]}
        style={[
          colorStyles.value,
          sizeStyles.value,
          props.style,
        ]}
      >
        { !slots.default
          ? (
              props.image
                ? (<CImg key="image" src={props.image} alt="" cover />)
                : props.icon
                  ? (<CIcon key="icon" icon={props.icon} />)
                  : props.text
            )
          : (
            <CDefaultsProvider
              key="content-defaults"
              defaults={{
                CImg: {
                  cover: true,
                  image: props.image,
                },
                CIcon: {
                  icon: props.icon,
                },
              }}
            >
              { slots.default() }
            </CDefaultsProvider>
            )}

        { genOverlays(false, 'v-avatar') }
      </props.tag>
    ))

    return {}
  },
})

export type CAvatar = InstanceType<typeof CAvatar>
