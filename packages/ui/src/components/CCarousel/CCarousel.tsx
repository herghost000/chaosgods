// Styles
import './CCarousel.sass'

// Components
import { onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { CBtn } from '@/components/CBtn'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CProgressLinear } from '@/components/CProgressLinear'
import { CWindow, makeCWindowProps } from '@/components/CWindow/CWindow'

// Composables
import { IconValue } from '@/composables/icons'
import { useLocale } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

// Types
import type { CWindowSlots } from '@/components/CWindow/CWindow'
import type { GroupProvide } from '@/composables/group'
import type { GenericProps } from '@/util'

export const makeCCarouselProps = propsFactory({
  color: String,
  cycle: Boolean,
  delimiterIcon: {
    type: IconValue,
    default: '$delimiter',
  },
  height: {
    type: [Number, String],
    default: 500,
  },
  hideDelimiters: Boolean,
  hideDelimiterBackground: Boolean,
  interval: {
    type: [Number, String],
    default: 6000,
    validator: (value: string | number) => Number(value) > 0,
  },
  progress: [Boolean, String],
  verticalDelimiters: [Boolean, String] as PropType<boolean | 'left' | 'right'>,

  ...makeCWindowProps({
    continuous: true,
    mandatory: 'force' as const,
    showArrows: true,
  }),
}, 'CCarousel')

type CCarouselSlots = CWindowSlots & {
  item: {
    props: Record<string, any>
    item: {
      id: number
      value: unknown
      disabled: boolean | undefined
    }
  }
}

export const CCarousel = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: CCarouselSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CCarousel',

  props: makeCCarouselProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const { t } = useLocale()
    const windowRef = ref<CWindow>()

    let slideTimeout = -1
    watch(model, restartTimeout)
    watch(() => props.interval, restartTimeout)
    watch(() => props.cycle, (val) => {
      if (val)
        restartTimeout()
      else window.clearTimeout(slideTimeout)
    })

    onMounted(startTimeout)

    function startTimeout() {
      if (!props.cycle || !windowRef.value)
        return

      slideTimeout = window.setTimeout(windowRef.value.group.next, +props.interval > 0 ? +props.interval : 6000)
    }

    function restartTimeout() {
      window.clearTimeout(slideTimeout)
      window.requestAnimationFrame(startTimeout)
    }

    useRender(() => {
      const windowProps = CWindow.filterProps(props)

      return (
        <CWindow
          ref={windowRef}
          {...windowProps}
          v-model={model.value}
          class={[
            'v-carousel',
            {
              'v-carousel--hide-delimiter-background': props.hideDelimiterBackground,
              'v-carousel--vertical-delimiters': props.verticalDelimiters,
            },
            props.class,
          ]}
          style={[
            { height: convertToUnit(props.height) },
            props.style,
          ]}
        >
          {{
            default: slots.default,
            additional: ({ group }: { group: GroupProvide }) => (
              <>
                { !props.hideDelimiters && (
                  <div
                    class="v-carousel__controls"
                    style={{
                      left: props.verticalDelimiters === 'left' && props.verticalDelimiters ? 0 : 'auto',
                      right: props.verticalDelimiters === 'right' ? 0 : 'auto',
                    }}
                  >
                    { group.items.value.length > 0 && (
                      <CDefaultsProvider
                        defaults={{
                          CBtn: {
                            color: props.color,
                            icon: props.delimiterIcon,
                            size: 'x-small',
                            variant: 'text',
                          },
                        }}
                        scoped
                      >
                        { group.items.value.map((item, index) => {
                          const props = {
                            'id': `carousel-item-${item.id}`,
                            'aria-label': t('$chaos.carousel.ariaLabel.delimiter', index + 1, group.items.value.length),
                            'class': [
                              'v-carousel__controls__item',
                              group.isSelected(item.id) && 'v-btn--active',
                            ],
                            'onClick': () => group.select(item.id, true),
                          }

                          return slots.item
                            ? slots.item({ props, item })
                            : (<CBtn {...item} {...props} />)
                        })}
                      </CDefaultsProvider>
                    )}
                  </div>
                )}

                { props.progress && (
                  <CProgressLinear
                    class="v-carousel__progress"
                    color={typeof props.progress === 'string' ? props.progress : undefined}
                    modelValue={(group.getItemIndex(model.value) + 1) / group.items.value.length * 100}
                  />
                )}
              </>
            ),
            prev: slots.prev,
            next: slots.next,
          }}
        </CWindow>
      )
    })

    return {}
  },
})

export type CCarousel = InstanceType<typeof CCarousel>
