import { computed, inject } from 'vue'
import type { InjectionKey } from 'vue'
import { CWindow, makeCWindowProps } from '@/components/CWindow/CWindow'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { GroupProvide } from '@/composables/group'

export const CStepperSymbol: InjectionKey<GroupProvide> = Symbol.for('chaos:v-stepper')

export const makeCStepperWindowProps = propsFactory({
  ...omit(makeCWindowProps(), ['continuous', 'nextIcon', 'prevIcon', 'showArrows', 'touch', 'mandatory']),
}, 'CStepperWindow')

export const CStepperWindow = genericComponent()({
  name: 'CStepperWindow',

  props: makeCStepperWindowProps(),

  emits: {
    'update:modelValue': (_v: unknown) => true,
  },

  setup(props, { slots }) {
    const group = inject(CStepperSymbol, null)
    const _model = useProxiedModel(props, 'modelValue')

    const model = computed({
      get() {
        // Always return modelValue if defined
        // or if not within a CStepper group
        if (_model.value != null || !group)
          return _model.value

        // If inside of a CStepper, find the currently selected
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
          _as="CStepperWindow"
          {...windowProps}
          v-model={model.value}
          class={[
            'v-stepper-window',
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

export type CStepperWindow = InstanceType<typeof CStepperWindow>
