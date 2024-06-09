import { computed, ref, toRefs } from 'vue'
import { CStepperVerticalItem } from './CStepperVerticalItem'
import { CExpansionPanels, makeCExpansionPanelsProps } from '@/components/CExpansionPanel/CExpansionPanels'
import { makeStepperProps } from '@/components/CStepper/CStepper'
import { provideDefaults } from '@/composables/defaults'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, getPropertyFromItem, omit, propsFactory, useRender } from '@/util'
import type { CStepperSlot } from '@/components/CStepper/CStepper'
import type { StepperItem, StepperItemSlot } from '@/components/CStepper/CStepperItem'

export type CStepperVerticalSlots = {
  actions: StepperItemSlot
  default: CStepperSlot & { step: unknown }
  icon: StepperItemSlot
  title: StepperItemSlot
  subtitle: StepperItemSlot
  item: StepperItem
  prev: StepperItemSlot
  next: StepperItemSlot
} & {
  [key: `header-item.${string}`]: StepperItemSlot
  [key: `item.${string}`]: StepperItem
}

export const makeCStepperVerticalProps = propsFactory({
  prevText: {
    type: String,
    default: '$vuetify.stepper.prev',
  },
  nextText: {
    type: String,
    default: '$vuetify.stepper.next',
  },

  ...makeStepperProps(),
  ...omit(makeCExpansionPanelsProps({
    mandatory: 'force' as const,
    variant: 'accordion' as const,
  }), ['static']),
}, 'CStepperVertical')

export const CStepperVertical = genericComponent<CStepperVerticalSlots>()({
  name: 'CStepperVertical',

  props: makeCStepperVerticalProps(),

  emits: {
    'update:modelValue': (_val: any) => true,
  },

  setup(props, { slots }) {
    const vExpansionPanelsRef = ref<typeof CExpansionPanels>()
    const { color, editable, prevText, nextText, hideActions } = toRefs(props)

    const model = useProxiedModel(props, 'modelValue')
    const items = computed(() => props.items.map((item, index) => {
      const title = getPropertyFromItem(item, props.itemTitle, item)
      const value = getPropertyFromItem(item, props.itemValue, index + 1)

      return {
        title,
        value,
        raw: item,
      }
    }))

    provideDefaults({
      CStepperVerticalItem: {
        color,
        editable,
        prevText,
        nextText,
        hideActions,
        static: true,
      },
      CStepperActions: {
        color,
      },
    })

    useRender(() => {
      const expansionPanelProps = CExpansionPanels.filterProps(props)

      return (
        <CExpansionPanels
          {...expansionPanelProps}
          v-model={model.value}
          ref={vExpansionPanelsRef}
          class={[
            'v-stepper',
            {
              'v-stepper--alt-labels': props.altLabels,
              'v-stepper--flat': props.flat,
              'v-stepper--non-linear': props.nonLinear,
              'v-stepper--mobile': props.mobile,
            },
            props.class,
          ]}
          style={props.style}
        >
          {{
            ...slots,
            default: ({
              prev,
              next,
            }) => {
              return (
                <>
                  { items.value.map(({ raw, ...item }) => (
                    <CStepperVerticalItem {...item}>
                      {{
                        ...slots,
                        default: slots[`item.${item.value}`],
                      }}
                    </CStepperVerticalItem>
                  ))}

                  { slots.default?.({ prev, next, step: model.value }) }
                </>
              )
            },
          }}
        </CExpansionPanels>
      )
    })

    return {}
  },
})

export type CStepperVertical = InstanceType<typeof CStepperVertical>
