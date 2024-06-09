import { inject } from 'vue'
import { CExpansionPanelSymbol } from './CExpansionPanels'
import { CExpandTransition } from '@/components/transitions'
import { makeComponentProps } from '@/composables/component'
import { makeLazyProps, useLazy } from '@/composables/lazy'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCExpansionPanelTextProps = propsFactory({
  ...makeComponentProps(),
  ...makeLazyProps(),
}, 'CExpansionPanelText')

export const CExpansionPanelText = genericComponent()({
  name: 'CExpansionPanelText',

  props: makeCExpansionPanelTextProps(),

  setup(props, { slots }) {
    const expansionPanel = inject(CExpansionPanelSymbol)

    if (!expansionPanel)
      throw new Error('[Vuetify] v-expansion-panel-text needs to be placed inside v-expansion-panel')

    const { hasContent, onAfterLeave } = useLazy(props, expansionPanel.isSelected)

    useRender(() => (
      <CExpandTransition onAfterLeave={onAfterLeave}>
        <div
          class={[
            'v-expansion-panel-text',
            props.class,
          ]}
          style={props.style}
          v-show={expansionPanel.isSelected.value}
        >
          { slots.default && hasContent.value && (
            <div class="v-expansion-panel-text__wrapper">
              { slots.default?.() }
            </div>
          )}
        </div>
      </CExpandTransition>
    ))

    return {}
  },
})

export type CExpansionPanelText = InstanceType<typeof CExpansionPanelText>
