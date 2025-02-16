import './CListItem.sass'
import { computed, watch } from 'vue'
import type { PropType } from 'vue'
import { CListItemSubtitle } from './CListItemSubtitle'
import { CListItemTitle } from './CListItemTitle'
import { useList } from './list'
import { CAvatar } from '@/components/CAvatar'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { IconValue } from '@/composables/icons'
import { useNestedItem } from '@/composables/nested/nested'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeRouterProps, useLink } from '@/composables/router'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genOverlays, makeVariantProps, useVariant } from '@/composables/variant'
import { Ripple } from '@/directives/ripple'
import { EventProp, deprecate, genericComponent, propsFactory, useRender } from '@/util'
import type { RippleDirectiveBinding } from '@/directives/ripple'

type ListItemSlot = {
  isActive: boolean
  isSelected: boolean
  isIndeterminate: boolean
  select: (value: boolean) => void
}

export type ListItemTitleSlot = {
  title?: string | number
}

export type ListItemSubtitleSlot = {
  subtitle?: string | number
}

export type CListItemSlots = {
  prepend: ListItemSlot
  append: ListItemSlot
  default: ListItemSlot
  title: ListItemTitleSlot
  subtitle: ListItemSubtitleSlot
}

export const makeCListItemProps = propsFactory({
  active: {
    type: Boolean,
    default: undefined,
  },
  activeClass: String,
  /* @deprecated */
  activeColor: String,
  appendAvatar: String,
  appendIcon: IconValue,
  baseColor: String,
  disabled: Boolean,
  lines: [Boolean, String] as PropType<'one' | 'two' | 'three' | false>,
  link: {
    type: Boolean,
    default: undefined,
  },
  nav: Boolean,
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object] as PropType<RippleDirectiveBinding['value']>,
    default: true,
  },
  slim: Boolean,
  subtitle: [String, Number],
  title: [String, Number],
  value: null,

  onClick: EventProp<[MouseEvent]>(),
  onClickOnce: EventProp<[MouseEvent]>(),

  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'text' } as const),
}, 'CListItem')

export const CListItem = genericComponent<CListItemSlots>()({
  name: 'CListItem',

  directives: { Ripple },

  props: makeCListItemProps(),

  emits: {
    click: (_e: MouseEvent | KeyboardEvent) => true,
  },

  setup(props, { attrs, slots, emit }) {
    const link = useLink(props, attrs)
    const id = computed(() => props.value === undefined ? link.href.value : props.value)
    const {
      activate,
      isActivated,
      select,
      isSelected,
      isIndeterminate,
      isGroupActivator,
      root,
      parent,
      openOnSelect,
    } = useNestedItem(id, false)
    const list = useList()
    const isActive = computed(() =>
      props.active !== false
      && (props.active || link.isActive?.value || (root.activatable.value ? isActivated.value : isSelected.value)),
    )
    const isLink = computed(() => props.link !== false && link.isLink.value)
    const isClickable = computed(() =>
      !props.disabled
      && props.link !== false
      && (props.link || link.isClickable.value || (!!list && (root.selectable.value || root.activatable.value || props.value != null))),
    )

    const roundedProps = computed(() => props.rounded || props.nav)
    const color = computed(() => props.color ?? props.activeColor)
    const variantProps = computed(() => ({
      color: isActive.value ? color.value ?? props.baseColor : props.baseColor,
      variant: props.variant,
    }))

    watch(() => link.isActive?.value, (val) => {
      if (val && parent.value != null)
        root.open(parent.value, true)

      if (val)
        openOnSelect(val)
    }, { immediate: true })

    const { themeClasses } = provideTheme(props)
    const { borderClasses } = useBorder(props)
    const { colorClasses, colorStyles, variantClasses } = useVariant(variantProps)
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(roundedProps)
    const lineClasses = computed(() => props.lines ? `v-list-item--${props.lines}-line` : undefined)

    const slotProps = computed(() => ({
      isActive: isActive.value,
      select,
      isSelected: isSelected.value,
      isIndeterminate: isIndeterminate.value,
    } satisfies ListItemSlot))

    function onClick(e: MouseEvent) {
      emit('click', e)

      if (!isClickable.value)
        return

      link.navigate?.(e)

      if (isGroupActivator)
        return

      if (root.activatable.value)
        activate(!isActivated.value, e)
      else if (root.selectable.value)
        select(!isSelected.value, e)
      else if (props.value != null)
        select(!isSelected.value, e)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e as any as MouseEvent)
      }
    }

    useRender(() => {
      const Tag = isLink.value ? 'a' : props.tag
      const hasTitle = (slots.title || props.title != null)
      const hasSubtitle = (slots.subtitle || props.subtitle != null)
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon)
      const hasAppend = !!(hasAppendMedia || slots.append)
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon)
      const hasPrepend = !!(hasPrependMedia || slots.prepend)

      list?.updateHasPrepend(hasPrepend)

      if (props.activeColor)
        deprecate('active-color', ['color', 'base-color'])

      return (
        <Tag
          class={[
            'v-list-item',
            {
              'v-list-item--active': isActive.value,
              'v-list-item--disabled': props.disabled,
              'v-list-item--link': isClickable.value,
              'v-list-item--nav': props.nav,
              'v-list-item--prepend': !hasPrepend && list?.hasPrepend.value,
              'v-list-item--slim': props.slim,
              [`${props.activeClass}`]: props.activeClass && isActive.value,
            },
            themeClasses.value,
            borderClasses.value,
            colorClasses.value,
            densityClasses.value,
            elevationClasses.value,
            lineClasses.value,
            roundedClasses.value,
            variantClasses.value,
            props.class,
          ]}
          style={[
            colorStyles.value,
            dimensionStyles.value,
            props.style,
          ]}
          href={link.href.value}
          tabindex={isClickable.value ? (list ? -2 : 0) : undefined}
          onClick={onClick}
          onKeydown={isClickable.value && !isLink.value && onKeyDown}
          v-ripple={isClickable.value && props.ripple}
        >
          { genOverlays(isClickable.value || isActive.value, 'v-list-item') }

          { hasPrepend && (
            <div key="prepend" class="v-list-item__prepend">
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
                      CListItemAction: {
                        start: true,
                      },
                    }}
                  >
                    { slots.prepend?.(slotProps.value) }
                  </CDefaultsProvider>
                  )}

              <div class="v-list-item__spacer" />
            </div>
          )}

          <div class="v-list-item__content" data-no-activator="">
            { hasTitle && (
              <CListItemTitle key="title">
                { slots.title?.({ title: props.title }) ?? props.title }
              </CListItemTitle>
            )}

            { hasSubtitle && (
              <CListItemSubtitle key="subtitle">
                { slots.subtitle?.({ subtitle: props.subtitle }) ?? props.subtitle }
              </CListItemSubtitle>
            )}

            { slots.default?.(slotProps.value) }
          </div>

          { hasAppend && (
            <div key="append" class="v-list-item__append">
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
                      CListItemAction: {
                        end: true,
                      },
                    }}
                  >
                    { slots.append?.(slotProps.value) }
                  </CDefaultsProvider>
                  )}

              <div class="v-list-item__spacer" />
            </div>
          )}
        </Tag>
      )
    })

    return {
      isGroupActivator,
      isSelected,
      list,
      select,
    }
  },
})

export type CListItem = InstanceType<typeof CListItem>
