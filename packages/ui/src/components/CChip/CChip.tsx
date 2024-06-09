import './CChip.sass'
import { computed } from 'vue'
import type { PropType } from 'vue'
import { CExpandXTransition } from '@/components/transitions'
import { CAvatar } from '@/components/CAvatar'
import { CChipGroupSymbol } from '@/components/CChipGroup/CChipGroup'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeGroupItemProps, useGroupItem } from '@/composables/group'
import { IconValue } from '@/composables/icons'
import { useLocale } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeRouterProps, useLink } from '@/composables/router'
import { makeSizeProps, useSize } from '@/composables/size'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genOverlays, makeVariantProps, useVariant } from '@/composables/variant'
import { Ripple } from '@/directives/ripple'
import { EventProp, genericComponent, propsFactory } from '@/util'
import type { RippleDirectiveBinding } from '@/directives/ripple'

export type CChipSlots = {
  default: {
    isSelected: boolean | undefined
    selectedClass: boolean | (string | undefined)[] | undefined
    select: ((value: boolean) => void) | undefined
    toggle: (() => void) | undefined
    value: unknown
    disabled: boolean
  }
  label: never
  prepend: never
  append: never
  close: never
  filter: never
}

export const makeCChipProps = propsFactory({
  activeClass: String,
  appendAvatar: String,
  appendIcon: IconValue,
  closable: Boolean,
  closeIcon: {
    type: IconValue,
    default: '$delete',
  },
  closeLabel: {
    type: String,
    default: '$chaos.close',
  },
  draggable: Boolean,
  filter: Boolean,
  filterIcon: {
    type: String,
    default: '$complete',
  },
  label: Boolean,
  link: {
    type: Boolean,
    default: undefined,
  },
  pill: Boolean,
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object] as PropType<RippleDirectiveBinding['value']>,
    default: true,
  },
  text: String,
  modelValue: {
    type: Boolean,
    default: true,
  },

  onClick: EventProp<[MouseEvent]>(),
  onClickOnce: EventProp<[MouseEvent]>(),

  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeElevationProps(),
  ...makeGroupItemProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeSizeProps(),
  ...makeTagProps({ tag: 'span' }),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'tonal' } as const),
}, 'CChip')

export const CChip = genericComponent<CChipSlots>()({
  name: 'CChip',

  directives: { Ripple },

  props: makeCChipProps(),

  emits: {
    'click:close': (_e: MouseEvent) => true,
    'update:modelValue': (_value: boolean) => true,
    'group:selected': (_val: { value: boolean }) => true,
    'click': (_e: MouseEvent | KeyboardEvent) => true,
  },

  setup(props, { attrs, emit, slots }) {
    const { t } = useLocale()
    const { borderClasses } = useBorder(props)
    const { colorClasses, colorStyles, variantClasses } = useVariant(props)
    const { densityClasses } = useDensity(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)
    const { sizeClasses } = useSize(props)
    const { themeClasses } = provideTheme(props)

    const isActive = useProxiedModel(props, 'modelValue')
    const group = useGroupItem(props, CChipGroupSymbol, false)
    const link = useLink(props, attrs)
    const isLink = computed(() => props.link !== false && link.isLink.value)
    const isClickable = computed(() =>
      !props.disabled
      && props.link !== false
      && (!!group || props.link || link.isClickable.value),
    )
    const closeProps = computed(() => ({
      'aria-label': t(props.closeLabel),
      onClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        isActive.value = false

        emit('click:close', e)
      },
    }))

    function onClick(e: MouseEvent) {
      emit('click', e)

      if (!isClickable.value)
        return

      link.navigate?.(e)
      group?.toggle()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e as any as MouseEvent)
      }
    }

    return () => {
      const Tag = (link.isLink.value) ? 'a' : props.tag
      const hasAppendMedia = !!(props.appendIcon || props.appendAvatar)
      const hasAppend = !!(hasAppendMedia || slots.append)
      const hasClose = !!(slots.close || props.closable)
      const hasFilter = !!(slots.filter || props.filter) && group
      const hasPrependMedia = !!(props.prependIcon || props.prependAvatar)
      const hasPrepend = !!(hasPrependMedia || slots.prepend)
      const hasColor = !group || group.isSelected.value

      return isActive.value && (
        <Tag
          class={[
            'v-chip',
            {
              'v-chip--disabled': props.disabled,
              'v-chip--label': props.label,
              'v-chip--link': isClickable.value,
              'v-chip--filter': hasFilter,
              'v-chip--pill': props.pill,
            },
            themeClasses.value,
            borderClasses.value,
            hasColor ? colorClasses.value : undefined,
            densityClasses.value,
            elevationClasses.value,
            roundedClasses.value,
            sizeClasses.value,
            variantClasses.value,
            group?.selectedClass.value,
            props.class,
          ]}
          style={[
            hasColor ? colorStyles.value : undefined,
            props.style,
          ]}
          disabled={props.disabled || undefined}
          draggable={props.draggable}
          href={link.href.value}
          tabindex={isClickable.value ? 0 : undefined}
          onClick={onClick}
          onKeydown={isClickable.value && !isLink.value && onKeyDown}
          v-ripple={[isClickable.value && props.ripple, null]}
        >
          { genOverlays(isClickable.value, 'v-chip') }

          { hasFilter && (
            <CExpandXTransition key="filter">
              <div
                class="v-chip__filter"
                v-show={group.isSelected.value}
              >
                { !slots.filter
                  ? (
                    <CIcon
                      key="filter-icon"
                      icon={props.filterIcon}
                    />
                    )
                  : (
                    <CDefaultsProvider
                      key="filter-defaults"
                      disabled={!props.filterIcon}
                      defaults={{
                        CIcon: { icon: props.filterIcon },
                      }}
                      v-slots:default={slots.filter}
                    />
                    )}
              </div>
            </CExpandXTransition>
          )}

          { hasPrepend && (
            <div key="prepend" class="v-chip__prepend">
              { !slots.prepend
                ? (
                  <>
                    { props.prependIcon && (
                      <CIcon
                        key="prepend-icon"
                        icon={props.prependIcon}
                        start
                      />
                    )}

                    { props.prependAvatar && (
                      <CAvatar
                        key="prepend-avatar"
                        image={props.prependAvatar}
                        start
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
                        image: props.prependAvatar,
                        start: true,
                      },
                      CIcon: {
                        icon: props.prependIcon,
                        start: true,
                      },
                    }}
                    v-slots:default={slots.prepend}
                  />
                  )}
            </div>
          )}

          <div class="v-chip__content" data-no-activator="">
            { slots.default?.({
              isSelected: group?.isSelected.value,
              selectedClass: group?.selectedClass.value,
              select: group?.select,
              toggle: group?.toggle,
              value: group?.value.value,
              disabled: props.disabled,
            }) ?? props.text }
          </div>

          { hasAppend && (
            <div key="append" class="v-chip__append">
              { !slots.append
                ? (
                  <>
                    { props.appendIcon && (
                      <CIcon
                        key="append-icon"
                        end
                        icon={props.appendIcon}
                      />
                    )}

                    { props.appendAvatar && (
                      <CAvatar
                        key="append-avatar"
                        end
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
                        end: true,
                        image: props.appendAvatar,
                      },
                      CIcon: {
                        end: true,
                        icon: props.appendIcon,
                      },
                    }}
                    v-slots:default={slots.append}
                  />
                  )}
            </div>
          )}

          { hasClose && (
            <button
              key="close"
              class="v-chip__close"
              type="button"
              {...closeProps.value}
            >
              { !slots.close
                ? (
                  <CIcon
                    key="close-icon"
                    icon={props.closeIcon}
                    size="x-small"
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="close-defaults"
                    defaults={{
                      CIcon: {
                        icon: props.closeIcon,
                        size: 'x-small',
                      },
                    }}
                    v-slots:default={slots.close}
                  />
                  )}
            </button>
          )}
        </Tag>
      )
    }
  },
})

export type CChip = InstanceType<typeof CChip>
