import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import { CExpansionPanelSymbol } from './CExpansionPanels'
import { CIcon } from '@/components/CIcon'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { IconValue } from '@/composables/icons'
import { Ripple } from '@/directives/ripple'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { RippleDirectiveBinding } from '@/directives/ripple'

interface ExpansionPanelTitleSlot {
  collapseIcon: IconValue
  disabled: boolean | undefined
  expanded: boolean
  expandIcon: IconValue
  readonly: boolean
}

export type CExpansionPanelTitleSlots = {
  default: ExpansionPanelTitleSlot
  actions: ExpansionPanelTitleSlot
}

export const makeCExpansionPanelTitleProps = propsFactory({
  color: String,
  expandIcon: {
    type: IconValue,
    default: '$expand',
  },
  collapseIcon: {
    type: IconValue,
    default: '$collapse',
  },
  hideActions: Boolean,
  focusable: Boolean,
  static: Boolean,
  ripple: {
    type: [Boolean, Object] as PropType<RippleDirectiveBinding['value']>,
    default: false,
  },
  readonly: Boolean,

  ...makeComponentProps(),
}, 'CExpansionPanelTitle')

export const CExpansionPanelTitle = genericComponent<CExpansionPanelTitleSlots>()({
  name: 'CExpansionPanelTitle',

  directives: { Ripple },

  props: makeCExpansionPanelTitleProps(),

  setup(props, { slots }) {
    const expansionPanel = inject(CExpansionPanelSymbol)

    if (!expansionPanel)
      throw new Error('[Vuetify] v-expansion-panel-title needs to be placed inside v-expansion-panel')

    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'color')

    const slotProps = computed(() => ({
      collapseIcon: props.collapseIcon,
      disabled: expansionPanel.disabled.value,
      expanded: expansionPanel.isSelected.value,
      expandIcon: props.expandIcon,
      readonly: props.readonly,
    }))

    useRender(() => (
      <button
        class={[
          'v-expansion-panel-title',
          {
            'v-expansion-panel-title--active': expansionPanel.isSelected.value,
            'v-expansion-panel-title--focusable': props.focusable,
            'v-expansion-panel-title--static': props.static,
          },
          backgroundColorClasses.value,
          props.class,
        ]}
        style={[
          backgroundColorStyles.value,
          props.style,
        ]}
        type="button"
        tabindex={expansionPanel.disabled.value ? -1 : undefined}
        disabled={expansionPanel.disabled.value}
        aria-expanded={expansionPanel.isSelected.value}
        onClick={!props.readonly ? expansionPanel.toggle : undefined}
        v-ripple={props.ripple}
      >
        <span class="v-expansion-panel-title__overlay" />

        { slots.default?.(slotProps.value) }

        { !props.hideActions && (
          <span class="v-expansion-panel-title__icon">
            {
              slots.actions
                ? slots.actions(slotProps.value)
                : <CIcon icon={expansionPanel.isSelected.value ? props.collapseIcon : props.expandIcon} />
            }
          </span>
        )}
      </button>
    ))

    return {}
  },
})

export type CExpansionPanelTitle = InstanceType<typeof CExpansionPanelTitle>
