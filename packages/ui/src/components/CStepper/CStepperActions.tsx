import type { PropType } from 'vue'
import { CBtn } from '@/components/CBtn/CBtn'
import { CDefaultsProvider } from '@/components/CDefaultsProvider/CDefaultsProvider'
import { useLocale } from '@/composables/locale'
import { genericComponent, propsFactory, useRender } from '@/util'

export type CStepperActionsSlots = {
  prev: {
    props: { onClick: () => void }
  }
  next: {
    props: { onClick: () => void }
  }
}

export const makeCStepperActionsProps = propsFactory({
  color: String,
  disabled: {
    type: [Boolean, String] as PropType<boolean | 'next' | 'prev'>,
    default: false,
  },
  prevText: {
    type: String,
    default: '$chaos.stepper.prev',
  },
  nextText: {
    type: String,
    default: '$chaos.stepper.next',
  },
}, 'CStepperActions')

export const CStepperActions = genericComponent<CStepperActionsSlots>()({
  name: 'CStepperActions',

  props: makeCStepperActionsProps(),

  emits: {
    'click:prev': () => true,
    'click:next': () => true,
  },

  setup(props, { emit, slots }) {
    const { t } = useLocale()
    function onClickPrev() {
      emit('click:prev')
    }

    function onClickNext() {
      emit('click:next')
    }

    useRender(() => {
      const prevSlotProps = {
        onClick: onClickPrev,
      }
      const nextSlotProps = {
        onClick: onClickNext,
      }

      return (
        <div class="v-stepper-actions">
          <CDefaultsProvider
            defaults={{
              CBtn: {
                disabled: ['prev', true].includes(props.disabled),
                text: t(props.prevText),
                variant: 'text',
              },
            }}
          >
            { slots.prev?.({ props: prevSlotProps }) ?? (
              <CBtn {...prevSlotProps} />
            )}
          </CDefaultsProvider>

          <CDefaultsProvider
            defaults={{
              CBtn: {
                color: props.color,
                disabled: ['next', true].includes(props.disabled),
                text: t(props.nextText),
                variant: 'tonal',
              },
            }}
          >
            { slots.next?.({ props: nextSlotProps }) ?? (
              <CBtn {...nextSlotProps} />
            )}
          </CDefaultsProvider>
        </div>
      )
    })

    return {}
  },
})

export type CStepperActions = InstanceType<typeof CStepperActions>
