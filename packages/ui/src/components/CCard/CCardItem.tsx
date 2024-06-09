// Components
import { CCardSubtitle } from './CCardSubtitle'
import { CCardTitle } from './CCardTitle'
import { CAvatar } from '@/components/CAvatar'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'

// Composables
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps } from '@/composables/density'
import { IconValue } from '@/composables/icons'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

export type CCardItemSlots = {
  default: never
  prepend: never
  append: never
  title: never
  subtitle: never
}

export const makeCCardItemProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  prependAvatar: String,
  prependIcon: IconValue,
  subtitle: [String, Number],
  title: [String, Number],

  ...makeComponentProps(),
  ...makeDensityProps(),
}, 'CCardItem')

export const CCardItem = genericComponent<CCardItemSlots>()({
  name: 'CCardItem',

  props: makeCCardItemProps(),

  setup(props, { slots }) {
    useRender(() => {
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon)
      const hasPrepend = !!(hasPrependMedia || slots.prepend)
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon)
      const hasAppend = !!(hasAppendMedia || slots.append)
      const hasTitle = !!(props.title != null || slots.title)
      const hasSubtitle = !!(props.subtitle != null || slots.subtitle)

      return (
        <div
          class={[
            'v-card-item',
            props.class,
          ]}
          style={props.style}
        >
          { hasPrepend && (
            <div key="prepend" class="v-card-item__prepend">
              { !slots.prepend
                ? (
                  <>
                    { props.prependAvatar && (
                      <CAvatar
                        key="prepend-avatar"
                        density={props.density}
                        image={props.prependAvatar}
                      />
                    )}

                    { props.prependIcon && (
                      <CIcon
                        key="prepend-icon"
                        density={props.density}
                        icon={props.prependIcon}
                      />
                    )}
                  </>
                  )
                : (
                  <CDefaultsProvider
                    key="prepend-defaults"
                    disabled={!hasPrependMedia}
                    defaults={{
                      CAvatar: {
                        density: props.density,
                        image: props.prependAvatar,
                      },
                      CIcon: {
                        density: props.density,
                        icon: props.prependIcon,
                      },
                    }}
                    v-slots:default={slots.prepend}
                  />
                  )}
            </div>
          )}

          <div class="v-card-item__content">
            { hasTitle && (
              <CCardTitle key="title">
                { slots.title?.() ?? props.title }
              </CCardTitle>
            )}

            { hasSubtitle && (
              <CCardSubtitle key="subtitle">
                { slots.subtitle?.() ?? props.subtitle }
              </CCardSubtitle>
            )}

            { slots.default?.() }
          </div>

          { hasAppend && (
            <div key="append" class="v-card-item__append">
              { !slots.append
                ? (
                  <>
                    { props.appendIcon && (
                      <CIcon
                        key="append-icon"
                        density={props.density}
                        icon={props.appendIcon}
                      />
                    )}

                    { props.appendAvatar && (
                      <CAvatar
                        key="append-avatar"
                        density={props.density}
                        image={props.appendAvatar}
                      />
                    )}
                  </>
                  )
                : (
                  <CDefaultsProvider
                    key="append-defaults"
                    disabled={!hasAppendMedia}
                    defaults={{
                      CAvatar: {
                        density: props.density,
                        image: props.appendAvatar,
                      },
                      CIcon: {
                        density: props.density,
                        icon: props.appendIcon,
                      },
                    }}
                    v-slots:default={slots.append}
                  />
                  )}
            </div>
          )}
        </div>
      )
    })

    return {}
  },
})

export type CCardItem = InstanceType<typeof CCardItem>
