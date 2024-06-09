import './CEmptyState.sass'
import { toRef } from 'vue'
import type { PropType } from 'vue'
import { CBtn } from '@/components/CBtn'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { CImg } from '@/components/CImg'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { useDisplay } from '@/composables/display'
import { IconValue } from '@/composables/icons'
import { makeSizeProps } from '@/composables/size'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

export type CEmptyStateSlots = {
  actions: {
    props: {
      onClick: (e: Event) => void
    }
  }
  default: never
  headline: never
  title: never
  media: never
  text: never
}

export const makeCEmptyStateProps = propsFactory({
  actionText: String,
  bgColor: String,
  color: String,
  icon: IconValue,
  image: String,
  justify: {
    type: String as PropType<'start' | 'center' | 'end'>,
    default: 'center',
  },
  headline: String,
  title: String,
  text: String,
  textWidth: {
    type: [Number, String],
    default: 500,
  },
  href: String,
  to: String,

  ...makeComponentProps(),
  ...makeDimensionProps(),
  ...makeSizeProps({ size: undefined }),
  ...makeThemeProps(),
}, 'CEmptyState')

export const CEmptyState = genericComponent<CEmptyStateSlots>()({
  name: 'CEmptyState',

  props: makeCEmptyStateProps(),

  emits: {
    'click:action': (_e: Event) => true,
  },

  setup(props, { emit, slots }) {
    const { themeClasses } = provideTheme(props)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { dimensionStyles } = useDimension(props)
    const { displayClasses } = useDisplay()

    function onClickAction(e: Event) {
      emit('click:action', e)
    }

    useRender(() => {
      const hasActions = !!(slots.actions || props.actionText)
      const hasHeadline = !!(slots.headline || props.headline)
      const hasTitle = !!(slots.title || props.title)
      const hasText = !!(slots.text || props.text)
      const hasMedia = !!(slots.media || props.image || props.icon)
      const size = props.size || (props.image ? 200 : 96)

      return (
        <div
          class={[
            'v-empty-state',
            {
              [`v-empty-state--${props.justify}`]: true,
            },
            themeClasses.value,
            backgroundColorClasses.value,
            displayClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            dimensionStyles.value,
            props.style,
          ]}
        >
          { hasMedia && (
            <div key="media" class="v-empty-state__media">
              { !slots.media
                ? (
                  <>
                    { props.image
                      ? (
                        <CImg
                          key="image"
                          src={props.image}
                          height={size}
                        />
                        )
                      : props.icon
                        ? (
                          <CIcon
                            key="icon"
                            color={props.color}
                            size={size}
                            icon={props.icon}
                          />
                          )
                        : undefined }
                  </>
                  )
                : (
                  <CDefaultsProvider
                    key="media-defaults"
                    defaults={{
                      CImg: {
                        src: props.image,
                        height: size,
                      },
                      CIcon: {
                        size,
                        icon: props.icon,
                      },
                    }}
                  >
                    { slots.media() }
                  </CDefaultsProvider>
                  )}
            </div>
          )}

          { hasHeadline && (
            <div key="headline" class="v-empty-state__headline">
              { slots.headline?.() ?? props.headline }
            </div>
          )}

          { hasTitle && (
            <div key="title" class="v-empty-state__title">
              { slots.title?.() ?? props.title }
            </div>
          )}

          { hasText && (
            <div
              key="text"
              class="v-empty-state__text"
              style={{
                maxWidth: convertToUnit(props.textWidth),
              }}
            >
              { slots.text?.() ?? props.text }
            </div>
          )}

          { slots.default && (
            <div key="content" class="v-empty-state__content">
              { slots.default() }
            </div>
          )}

          { hasActions && (
            <div key="actions" class="v-empty-state__actions">
              <CDefaultsProvider
                defaults={{
                  CBtn: {
                    class: 'v-empty-state__action-btn',
                    color: props.color,
                    text: props.actionText,
                  },
                }}
              >
                {
                  slots.actions?.({ props: { onClick: onClickAction } }) ?? (
                    <CBtn onClick={onClickAction} />
                  )
                }
              </CDefaultsProvider>
            </div>
          )}
        </div>
      )
    })

    return {}
  },
})

export type CEmptyState = InstanceType<typeof CEmptyState>
