import { computed, provide } from 'vue'
import { CExpansionPanelSymbol } from './CExpansionPanels'
import { CExpansionPanelText, makeCExpansionPanelTextProps } from './CExpansionPanelText'
import { CExpansionPanelTitle, makeCExpansionPanelTitleProps } from './CExpansionPanelTitle'
import { useBackgroundColor } from '@/composables/color'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeGroupItemProps, useGroupItem } from '@/composables/group'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCExpansionPanelProps = propsFactory({
  title: String,
  text: String,
  bgColor: String,

  ...makeElevationProps(),
  ...makeGroupItemProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeCExpansionPanelTitleProps(),
  ...makeCExpansionPanelTextProps(),
}, 'CExpansionPanel')

export type CExpansionPanelSlots = {
  default: never
  title: never
  text: never
}

export const CExpansionPanel = genericComponent<CExpansionPanelSlots>()({
  name: 'CExpansionPanel',

  props: makeCExpansionPanelProps(),

  emits: {
    'group:selected': (_val: { value: boolean }) => true,
  },

  setup(props, { slots }) {
    const groupItem = useGroupItem(props, CExpansionPanelSymbol)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)
    const isDisabled = computed(() => groupItem?.disabled.value || props.disabled)

    const selectedIndices = computed(() => groupItem.group.items.value.reduce<number[]>((arr, item, index) => {
      if (groupItem.group.selected.value.includes(item.id))
        arr.push(index)
      return arr
    }, []))

    const isBeforeSelected = computed(() => {
      const index = groupItem.group.items.value.findIndex(item => item.id === groupItem.id)
      return !groupItem.isSelected.value
        && selectedIndices.value.some(selectedIndex => selectedIndex - index === 1)
    })

    const isAfterSelected = computed(() => {
      const index = groupItem.group.items.value.findIndex(item => item.id === groupItem.id)
      return !groupItem.isSelected.value
        && selectedIndices.value.some(selectedIndex => selectedIndex - index === -1)
    })

    provide(CExpansionPanelSymbol, groupItem)

    useRender(() => {
      const hasText = !!(slots.text || props.text)
      const hasTitle = !!(slots.title || props.title)

      const expansionPanelTitleProps = CExpansionPanelTitle.filterProps(props)
      const expansionPanelTextProps = CExpansionPanelText.filterProps(props)

      return (
        <props.tag
          class={[
            'v-expansion-panel',
            {
              'v-expansion-panel--active': groupItem.isSelected.value,
              'v-expansion-panel--before-active': isBeforeSelected.value,
              'v-expansion-panel--after-active': isAfterSelected.value,
              'v-expansion-panel--disabled': isDisabled.value,
            },
            roundedClasses.value,
            backgroundColorClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            props.style,
          ]}
        >
          <div
            class={[
              'v-expansion-panel__shadow',
              ...elevationClasses.value,
            ]}
          />

          { hasTitle && (
            <CExpansionPanelTitle
              key="title"
              {...expansionPanelTitleProps}
            >
              { slots.title ? slots.title() : props.title }
            </CExpansionPanelTitle>
          )}

          { hasText && (
            <CExpansionPanelText
              key="text"
              {...expansionPanelTextProps}
            >
              { slots.text ? slots.text() : props.text }
            </CExpansionPanelText>
          )}

          { slots.default?.() }
        </props.tag>
      )
    })

    return {
      groupItem,
    }
  },
})

export type CExpansionPanel = InstanceType<typeof CExpansionPanel>
