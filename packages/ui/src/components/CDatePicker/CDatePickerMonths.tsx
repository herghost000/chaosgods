import './CDatePickerMonths.sass'
import { computed, watchEffect } from 'vue'
import { CBtn } from '@/components/CBtn'
import { useDate } from '@/composables/date'
import { useProxiedModel } from '@/composables/proxiedModel'
import { convertToUnit, createRange, genericComponent, propsFactory, useRender } from '@/util'

export type CDatePickerMonthsSlots = {
  month: {
    month: {
      text: string
      value: number
    }
    i: number
    props: {
      onClick: () => void
    }
  }
}

export const makeCDatePickerMonthsProps = propsFactory({
  color: String,
  height: [String, Number],
  modelValue: Number,
}, 'CDatePickerMonths')

export const CDatePickerMonths = genericComponent<CDatePickerMonthsSlots>()({
  name: 'CDatePickerMonths',

  props: makeCDatePickerMonthsProps(),

  emits: {
    'update:modelValue': (_date: any) => true,
  },

  setup(props, { emit, slots }) {
    const adapter = useDate()
    const model = useProxiedModel(props, 'modelValue')

    const months = computed(() => {
      let date = adapter.startOfYear(adapter.date())

      return createRange(12).map((i) => {
        const text = adapter.format(date, 'monthShort')
        date = adapter.getNextMonth(date)

        return {
          text,
          value: i,
        }
      })
    })

    watchEffect(() => {
      model.value = model.value ?? adapter.getMonth(adapter.date())
    })

    useRender(() => (
      <div
        class="v-date-picker-months"
        style={{
          height: convertToUnit(props.height),
        }}
      >
        <div class="v-date-picker-months__content">
          { months.value.map((month, i) => {
            const btnProps = {
              active: model.value === i,
              color: model.value === i ? props.color : undefined,
              rounded: true,
              text: month.text,
              variant: model.value === month.value ? 'flat' : 'text',
              onClick: () => onClick(i),
            } as const

            function onClick(i: number) {
              if (model.value === i) {
                emit('update:modelValue', model.value)
                return
              }
              model.value = i
            }

            return slots.month?.({
              month,
              i,
              props: btnProps,
            }) ?? (
              <CBtn
                key="month"
                {...btnProps}
              />
            )
          })}
        </div>
      </div>
    ))

    return {}
  },
})

export type CDatePickerMonths = InstanceType<typeof CDatePickerMonths>
