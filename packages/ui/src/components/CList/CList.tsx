import './CList.sass'
import { computed, ref, shallowRef, toRef } from 'vue'
import type { PropType } from 'vue'
import { CListChildren } from './CListChildren'
import { createList } from './list'
import type { CListChildrenSlots } from './CListChildren'
import { makeBorderProps, useBorder } from '@/composables/border'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeItemsProps } from '@/composables/list-items'
import { makeNestedProps, useNested } from '@/composables/nested/nested'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeVariantProps } from '@/composables/variant'
import { focusChild, genericComponent, getPropertyFromItem, omit, propsFactory, useRender } from '@/util'
import type { ItemProps, ListItem } from '@/composables/list-items'
import type { GenericProps, SelectItemKey } from '@/util'

export interface InternalListItem<T = any> extends ListItem<T> {
  type?: 'item' | 'subheader' | 'divider'
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function transformItem(props: ItemProps & { itemType: string }, item: any): InternalListItem {
  const type = getPropertyFromItem(item, props.itemType, 'item')
  const title = isPrimitive(item) ? item : getPropertyFromItem(item, props.itemTitle)
  const value = getPropertyFromItem(item, props.itemValue, undefined)
  const children = getPropertyFromItem(item, props.itemChildren)
  const itemProps = props.itemProps === true
    ? omit(item, ['children'])
    : getPropertyFromItem(item, props.itemProps)

  const _props = {
    title,
    value,
    ...itemProps,
  }

  return {
    type,
    title: _props.title,
    value: _props.value,
    props: _props,
    children: type === 'item' && children ? transformItems(props, children) : undefined,
    raw: item,
  }
}

function transformItems(props: ItemProps & { itemType: string }, items: (string | object)[]) {
  const array: InternalListItem[] = []

  for (const item of items)
    array.push(transformItem(props, item))

  return array
}

export function useListItems(props: ItemProps & { itemType: string }) {
  const items = computed(() => transformItems(props, props.items))

  return { items }
}

export const makeCListProps = propsFactory({
  baseColor: String,
  /* @deprecated */
  activeColor: String,
  activeClass: String,
  bgColor: String,
  disabled: Boolean,
  expandIcon: String,
  collapseIcon: String,
  lines: {
    type: [Boolean, String] as PropType<'one' | 'two' | 'three' | false>,
    default: 'one',
  },
  slim: Boolean,
  nav: Boolean,

  ...makeNestedProps({
    selectStrategy: 'single-leaf' as const,
    openStrategy: 'list' as const,
  }),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  itemType: {
    type: String,
    default: 'type',
  },
  ...makeItemsProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({ variant: 'text' } as const),
}, 'CList')

type ItemType<T> = T extends readonly (infer U)[] ? U : never

export const CList = genericComponent<new<
  T extends readonly any[],
  S = unknown,
  O = unknown,
>(
  props: {
    'items'?: T
    'itemTitle'?: SelectItemKey<ItemType<T>>
    'itemValue'?: SelectItemKey<ItemType<T>>
    'itemChildren'?: SelectItemKey<ItemType<T>>
    'itemProps'?: SelectItemKey<ItemType<T>>
    'selected'?: S
    'onUpdate:selected'?: (value: S) => void
    'opened'?: O
    'onUpdate:opened'?: (value: O) => void
  },
  slots: CListChildrenSlots<ItemType<T>>
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CList',

  props: makeCListProps(),

  emits: {
    'update:selected': (_value: unknown) => true,
    'update:activated': (_value: unknown) => true,
    'update:opened': (_value: unknown) => true,
    'click:open': (_value: { id: unknown, value: boolean, path: unknown[] }) => true,
    'click:activate': (_value: { id: unknown, value: boolean, path: unknown[] }) => true,
    'click:select': (_value: { id: unknown, value: boolean, path: unknown[] }) => true,
  },

  setup(props, { slots }) {
    const { items } = useListItems(props)
    const { themeClasses } = provideTheme(props)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { borderClasses } = useBorder(props)
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)
    const { children, open, parents, select } = useNested(props)
    const lineClasses = computed(() => props.lines ? `v-list--${props.lines}-line` : undefined)
    const activeColor = toRef(props, 'activeColor')
    const baseColor = toRef(props, 'baseColor')
    const color = toRef(props, 'color')

    createList()

    provideDefaults({
      CListGroup: {
        activeColor,
        baseColor,
        color,
        expandIcon: toRef(props, 'expandIcon'),
        collapseIcon: toRef(props, 'collapseIcon'),
      },
      CListItem: {
        activeClass: toRef(props, 'activeClass'),
        activeColor,
        baseColor,
        color,
        density: toRef(props, 'density'),
        disabled: toRef(props, 'disabled'),
        lines: toRef(props, 'lines'),
        nav: toRef(props, 'nav'),
        slim: toRef(props, 'slim'),
        variant: toRef(props, 'variant'),
      },
    })

    const isFocused = shallowRef(false)
    const contentRef = ref<HTMLElement>()
    function onFocusin(_e: FocusEvent) {
      isFocused.value = true
    }

    function onFocusout(_e: FocusEvent) {
      isFocused.value = false
    }

    function onFocus(e: FocusEvent) {
      if (
        !isFocused.value
        && !(e.relatedTarget && contentRef.value?.contains(e.relatedTarget as Node))
      ) focus()
    }

    function onKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement

      if (!contentRef.value || ['INPUT', 'TEXTAREA'].includes(target.tagName))
        return

      if (e.key === 'ArrowDown')
        focus('next')
      else if (e.key === 'ArrowUp')
        focus('prev')
      else if (e.key === 'Home')
        focus('first')
      else if (e.key === 'End')
        focus('last')
      else
        return

      e.preventDefault()
    }

    function onMousedown(_e: MouseEvent) {
      isFocused.value = true
    }

    function focus(location?: 'next' | 'prev' | 'first' | 'last') {
      if (contentRef.value)
        return focusChild(contentRef.value, location)
    }

    useRender(() => {
      return (
        <props.tag
          ref={contentRef}
          class={[
            'v-list',
            {
              'v-list--disabled': props.disabled,
              'v-list--nav': props.nav,
              'v-list--slim': props.slim,
            },
            themeClasses.value,
            backgroundColorClasses.value,
            borderClasses.value,
            densityClasses.value,
            elevationClasses.value,
            lineClasses.value,
            roundedClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            dimensionStyles.value,
            props.style,
          ]}
          tabindex={(props.disabled || isFocused.value) ? -1 : 0}
          role="listbox"
          aria-activedescendant={undefined}
          onFocusin={onFocusin}
          onFocusout={onFocusout}
          onFocus={onFocus}
          onKeydown={onKeydown}
          onMousedown={onMousedown}
        >
          <CListChildren
            items={items.value}
            returnObject={props.returnObject}
            v-slots={slots}
          />
        </props.tag>
      )
    })

    return {
      open,
      select,
      focus,
      children,
      parents,
    }
  },
})

export type CList = InstanceType<typeof CList>
