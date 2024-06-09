import './CCard.sass'
import { computed } from 'vue'
import type { PropType } from 'vue'
import { CCardActions } from './CCardActions'
import { CCardItem } from './CCardItem'
import { CCardText } from './CCardText'
import type { CCardItemSlots } from './CCardItem'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CImg } from '@/components/CImg'
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { IconValue } from '@/composables/icons'
import { LoaderSlot, makeLoaderProps, useLoader } from '@/composables/loader'
import { makeLocationProps, useLocation } from '@/composables/location'
import { makePositionProps, usePosition } from '@/composables/position'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeRouterProps, useLink } from '@/composables/router'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genOverlays, makeVariantProps, useVariant } from '@/composables/variant'
import { Ripple } from '@/directives/ripple'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { LoaderSlotProps } from '@/composables/loader'
import type { RippleDirectiveBinding } from '@/directives/ripple'

export const makeCCardProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  disabled: Boolean,
  flat: Boolean,
  hover: Boolean,
  image: String,
  link: {
    type: Boolean,
    default: undefined,
  },
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object] as PropType<RippleDirectiveBinding['value']>,
    default: true,
  },
  subtitle: [String, Number],
  text: [String, Number],
  title: [String, Number],

  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeLoaderProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'elevated' } as const),
}, 'CCard')

export type CCardSlots = CCardItemSlots & {
  default: never
  actions: never
  text: never
  loader: LoaderSlotProps
  image: never
  item: never
}

export const CCard = genericComponent<CCardSlots>()({
  name: 'CCard',

  directives: { Ripple },

  props: makeCCardProps(),

  setup(props, { attrs, slots }) {
    const { themeClasses } = provideTheme(props)
    const { borderClasses } = useBorder(props)
    const { colorClasses, colorStyles, variantClasses } = useVariant(props)
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { loaderClasses } = useLoader(props)
    const { locationStyles } = useLocation(props)
    const { positionClasses } = usePosition(props)
    const { roundedClasses } = useRounded(props)
    const link = useLink(props, attrs)

    const isLink = computed(() => props.link !== false && link.isLink.value)
    const isClickable = computed(() =>
      !props.disabled
      && props.link !== false
      && (props.link || link.isClickable.value),
    )

    useRender(() => {
      const Tag = isLink.value ? 'a' : props.tag
      const hasTitle = !!(slots.title || props.title != null)
      const hasSubtitle = !!(slots.subtitle || props.subtitle != null)
      const hasHeader = hasTitle || hasSubtitle
      const hasAppend = !!(slots.append || props.appendAvatar || props.appendIcon)
      const hasPrepend = !!(slots.prepend || props.prependAvatar || props.prependIcon)
      const hasImage = !!(slots.image || props.image)
      const hasCardItem = hasHeader || hasPrepend || hasAppend
      const hasText = !!(slots.text || props.text != null)

      return (
        <Tag
          class={[
            'v-card',
            {
              'v-card--disabled': props.disabled,
              'v-card--flat': props.flat,
              'v-card--hover': props.hover && !(props.disabled || props.flat),
              'v-card--link': isClickable.value,
            },
            themeClasses.value,
            borderClasses.value,
            colorClasses.value,
            densityClasses.value,
            elevationClasses.value,
            loaderClasses.value,
            positionClasses.value,
            roundedClasses.value,
            variantClasses.value,
            props.class,
          ]}
          style={[
            colorStyles.value,
            dimensionStyles.value,
            locationStyles.value,
            props.style,
          ]}
          href={link.href.value}
          onClick={isClickable.value && link.navigate}
          v-ripple={isClickable.value && props.ripple}
          tabindex={props.disabled ? -1 : undefined}
        >
          { hasImage && (
            <div key="image" class="v-card__image">
              { !slots.image
                ? (
                  <CImg
                    key="image-img"
                    cover
                    src={props.image}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="image-defaults"
                    disabled={!props.image}
                    defaults={{
                      CImg: {
                        cover: true,
                        src: props.image,
                      },
                    }}
                    v-slots:default={slots.image}
                  />
                  )}
            </div>
          )}

          <LoaderSlot
            name="v-card"
            active={!!props.loading}
            color={typeof props.loading === 'boolean' ? undefined : props.loading}
            v-slots={{ default: slots.loader }}
          />

          { hasCardItem && (
            <CCardItem
              key="item"
              prependAvatar={props.prependAvatar}
              prependIcon={props.prependIcon}
              title={props.title}
              subtitle={props.subtitle}
              appendAvatar={props.appendAvatar}
              appendIcon={props.appendIcon}
            >
              {{
                default: slots.item,
                prepend: slots.prepend,
                title: slots.title,
                subtitle: slots.subtitle,
                append: slots.append,
              }}
            </CCardItem>
          )}

          { hasText && (
            <CCardText key="text">
              { slots.text?.() ?? props.text }
            </CCardText>
          )}

          { slots.default?.() }

          { slots.actions && (
            <CCardActions v-slots={{ default: slots.actions }} />
          )}

          { genOverlays(isClickable.value, 'v-card') }
        </Tag>
      )
    })

    return {}
  },
})

export type CCard = InstanceType<typeof CCard>
