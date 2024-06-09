import { computed, inject } from 'vue'
import { CTabsSymbol } from './shared'
import { CWindow, makeCWindowProps } from '@/components/CWindow/CWindow'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender } from '@/util'

export const makeCTabsWindowProps = propsFactory({
  ...omit(makeCWindowProps(), ['continuous', 'nextIcon', 'prevIcon', 'showArrows', 'touch', 'mandatory']),
}, 'CTabsWindow')

export const CTabsWindow = genericComponent()({
  name: 'CTabsWindow',

  props: makeCTabsWindowProps(),

  emits: {
    'update:modelValue': (_v: unknown) => true,
  },

  setup(props, { slots }) {
    const group = inject(CTabsSymbol, null)
    const _model = useProxiedModel(props, 'modelValue')

    const model = computed({
      get() {
        // Always return modelValue if defined
        // or if not within a CTabs group
        if (_model.value != null || !group)
          return _model.value

        // If inside of a CTabs, find the currently selected
        // item by id. Item value may be assigned by its index
        return group.items.value.find(item => group.selected.value.includes(item.id))?.value
      },
      set(val) {
        _model.value = val
      },
    })

    useRender(() => {
      const windowProps = CWindow.filterProps(props)

      return (
        <CWindow
          _as="CTabsWindow"
          {...windowProps}
          v-model={model.value}
          class={[
            'v-tabs-window',
            props.class,
          ]}
          style={props.style}
          mandatory={false}
          touch={false}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CTabsWindow = InstanceType<typeof CTabsWindow>
