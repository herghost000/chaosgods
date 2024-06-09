import { CStepperActions, makeCStepperActionsProps } from '@/components/CStepper/CStepperActions'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CStepperActionsSlots } from '@/components/CStepper/CStepperActions'

export const makeCStepperVerticalActionsProps = propsFactory({
  ...makeCStepperActionsProps(),
}, 'CStepperActions')

export const CStepperVerticalActions = genericComponent<CStepperActionsSlots>()({
  name: 'CStepperVerticalActions',

  props: makeCStepperVerticalActionsProps(),

  emits: {
    'click:prev': () => true,
    'click:next': () => true,
  },

  setup(props, { emit, slots }) {
    function onClickPrev() {
      emit('click:prev')
    }

    function onClickNext() {
      emit('click:next')
    }

    useRender(() => {
      const stepperActionsProps = CStepperActions.filterProps(props)

      return (
        <CStepperActions
          class="v-stepper-vertical-actions"
          {...stepperActionsProps}
          onClick:prev={onClickPrev}
          onClick:next={onClickNext}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CStepperVerticalActions = InstanceType<typeof CStepperVerticalActions>
