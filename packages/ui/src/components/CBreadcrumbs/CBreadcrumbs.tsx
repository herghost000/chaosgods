import './CBreadcrumbs.sass'
import { computed, toRef } from 'vue'
import type { PropType } from 'vue'
import { CBreadcrumbsDivider } from './CBreadcrumbsDivider'
import { CBreadcrumbsItem } from './CBreadcrumbsItem'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeDensityProps, useDensity } from '@/composables/density'
import { IconValue } from '@/composables/icons'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { LinkProps } from '@/composables/router'
import type { GenericProps } from '@/util'

export type InternalBreadcrumbItem = Partial<LinkProps> & {
  title: string
  disabled?: boolean
}

export type BreadcrumbItem = string | InternalBreadcrumbItem

export const makeCBreadcrumbsProps = propsFactory({
  activeClass: String,
  activeColor: String,
  bgColor: String,
  color: String,
  disabled: Boolean,
  divider: {
    type: String,
    default: '/',
  },
  icon: IconValue,
  items: {
    type: Array as PropType<readonly BreadcrumbItem[]>,
    default: () => ([]),
  },

  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeRoundedProps(),
  ...makeTagProps({ tag: 'ul' }),
}, 'CBreadcrumbs')

export const CBreadcrumbs = genericComponent<new<T extends BreadcrumbItem>(
  props: {
    items?: T[]
  },
  slots: {
    prepend: never
    title: { item: InternalBreadcrumbItem, index: number }
    divider: { item: T, index: number }
    item: { item: InternalBreadcrumbItem, index: number }
    default: never
  }
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CBreadcrumbs',

  props: makeCBreadcrumbsProps(),

  setup(props, { slots }) {
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { densityClasses } = useDensity(props)
    const { roundedClasses } = useRounded(props)

    provideDefaults({
      CBreadcrumbsDivider: {
        divider: toRef(props, 'divider'),
      },
      CBreadcrumbsItem: {
        activeClass: toRef(props, 'activeClass'),
        activeColor: toRef(props, 'activeColor'),
        color: toRef(props, 'color'),
        disabled: toRef(props, 'disabled'),
      },
    })

    const items = computed(() => props.items.map((item) => {
      return typeof item === 'string' ? { item: { title: item }, raw: item } : { item, raw: item }
    }))

    useRender(() => {
      const hasPrepend = !!(slots.prepend || props.icon)

      return (
        <props.tag
          class={[
            'v-breadcrumbs',
            backgroundColorClasses.value,
            densityClasses.value,
            roundedClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            props.style,
          ]}
        >
          { hasPrepend && (
            <li key="prepend" class="v-breadcrumbs__prepend">
              { !slots.prepend
                ? (
                  <CIcon
                    key="prepend-icon"
                    start
                    icon={props.icon}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="prepend-defaults"
                    disabled={!props.icon}
                    defaults={{
                      CIcon: {
                        icon: props.icon,
                        start: true,
                      },
                    }}
                    v-slots:default={slots.prepend}
                  />
                  )}
            </li>
          )}

          { items.value.map(({ item, raw }, index, array) => (
            <>
              { slots.item?.({ item, index }) ?? (
                <CBreadcrumbsItem
                  key={index}
                  disabled={index >= array.length - 1}
                  {...(typeof item === 'string' ? { title: item } : item)}
                  v-slots={{
                    default: slots.title ? () => slots.title?.({ item, index }) : undefined,
                  }}
                />
              )}

              { index < array.length - 1 && (
                <CBreadcrumbsDivider
                  v-slots={{
                    default: slots.divider ? () => slots.divider?.({ item: raw, index }) : undefined,
                  }}
                />
              )}
            </>
          ))}

          { slots.default?.() }
        </props.tag>
      )
    })

    return {}
  },
})

export type CBreadcrumbs = InstanceType<typeof CBreadcrumbs>
