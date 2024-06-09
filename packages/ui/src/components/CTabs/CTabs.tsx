import './CTabs.sass'
import { computed, toRef } from 'vue'
import type { PropType } from 'vue'
import { CTab } from './CTab'
import { CTabsWindow } from './CTabsWindow'
import { CTabsWindowItem } from './CTabsWindowItem'
import { CTabsSymbol } from './shared'
import { CSlideGroup, makeCSlideGroupProps } from '@/components/CSlideGroup/CSlideGroup'
import { useBackgroundColor } from '@/composables/color'
import { provideDefaults } from '@/composables/defaults'
import { makeDensityProps, useDensity } from '@/composables/density'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useScopeId } from '@/composables/scopeId'
import { makeTagProps } from '@/composables/tag'
import { convertToUnit, genericComponent, isObject, propsFactory, useRender } from '@/util'

export type TabItem = string | number | Record<string, any>

export type VTabsSlot = {
  item: TabItem
}

export type VTabsSlots = {
  default: never
  tab: VTabsSlot
  item: VTabsSlot
  window: never
} & {
  [key: `tab.${string}`]: VTabsSlot
  [key: `item.${string}`]: VTabsSlot
}

function parseItems(items: readonly TabItem[] | undefined) {
  if (!items)
    return []

  return items.map((item) => {
    if (!isObject(item))
      return { text: item, value: item }

    return item
  })
}

export const makeVTabsProps = propsFactory({
  alignTabs: {
    type: String as PropType<'start' | 'title' | 'center' | 'end'>,
    default: 'start',
  },
  color: String,
  fixedTabs: Boolean,
  items: {
    type: Array as PropType<readonly TabItem[]>,
    default: () => ([]),
  },
  stacked: Boolean,
  bgColor: String,
  grow: Boolean,
  height: {
    type: [Number, String],
    default: undefined,
  },
  hideSlider: Boolean,
  sliderColor: String,

  ...makeCSlideGroupProps({
    mandatory: 'force' as const,
    selectedClass: 'v-tab-item--selected',
  }),
  ...makeDensityProps(),
  ...makeTagProps(),
}, 'CTabs')

export const CTabs = genericComponent<VTabsSlots>()({
  name: 'CTabs',

  props: makeVTabsProps(),

  emits: {
    'update:modelValue': (_v: unknown) => true,
  },

  setup(props, { attrs, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const items = computed(() => parseItems(props.items))
    const { densityClasses } = useDensity(props)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { scopeId } = useScopeId()

    provideDefaults({
      CTab: {
        color: toRef(props, 'color'),
        direction: toRef(props, 'direction'),
        stacked: toRef(props, 'stacked'),
        fixed: toRef(props, 'fixedTabs'),
        sliderColor: toRef(props, 'sliderColor'),
        hideSlider: toRef(props, 'hideSlider'),
      },
    })

    useRender(() => {
      const slideGroupProps = CSlideGroup.filterProps(props)
      const hasWindow = !!(slots.window || props.items.length > 0)

      return (
        <>
          <CSlideGroup
            {...slideGroupProps}
            v-model={model.value}
            class={[
              'v-tabs',
              `v-tabs--${props.direction}`,
              `v-tabs--align-tabs-${props.alignTabs}`,
              {
                'v-tabs--fixed-tabs': props.fixedTabs,
                'v-tabs--grow': props.grow,
                'v-tabs--stacked': props.stacked,
              },
              densityClasses.value,
              backgroundColorClasses.value,
              props.class,
            ]}
            style={[
              { '--v-tabs-height': convertToUnit(props.height) },
              backgroundColorStyles.value,
              props.style,
            ]}
            role="tablist"
            symbol={CTabsSymbol}
            {...scopeId}
            {...attrs}
          >
            { slots.default?.() ?? items.value.map(item => (
              slots.tab?.({ item }) ?? (
                <CTab
                  {...item}
                  key={item.text}
                  value={item.value}
                  v-slots={{
                    default: () => slots[`tab.${item.value}`]?.({ item }),
                  }}
                />
              )
            ))}
          </CSlideGroup>

          { hasWindow && (
            <CTabsWindow
              v-model={model.value}
              key="tabs-window"
              {...scopeId}
            >
              { items.value.map(item => slots.item?.({ item }) ?? (
                <CTabsWindowItem
                  value={item.value}
                  v-slots={{
                    default: () => slots[`item.${item.value}`]?.({ item }),
                  }}
                />
              ))}

              { slots.window?.() }
            </CTabsWindow>
          )}
        </>
      )
    })

    return {}
  },
})

export type CTabs = InstanceType<typeof CTabs>
