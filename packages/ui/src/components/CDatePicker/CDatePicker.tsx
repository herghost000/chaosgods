import './CDatePicker.sass'
import { computed, ref, shallowRef, watch } from 'vue'
import { CDatePickerControls, makeCDatePickerControlsProps } from './CDatePickerControls'
import { CDatePickerHeader } from './CDatePickerHeader'
import { CDatePickerMonth, makeCDatePickerMonthProps } from './CDatePickerMonth'
import { CDatePickerMonths, makeCDatePickerMonthsProps } from './CDatePickerMonths'
import { CDatePickerYears, makeCDatePickerYearsProps } from './CDatePickerYears'
import { CFadeTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CPicker, makeCPickerProps } from '@/labs/CPicker/CPicker'
import { useDate } from '@/composables/date'
import { useLocale } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender, wrapInArray } from '@/util'
import type { CPickerSlots } from '@/labs/CPicker/CPicker'
import type { GenericProps } from '@/util'

export type CDatePickerSlots = Omit<CPickerSlots, 'header'> & {
  header: {
    header: string
    transition: string
  }
}

export const makeCDatePickerProps = propsFactory({
  // TODO: implement in v3.5
  // calendarIcon: {
  //   type: String,
  //   default: '$calendar',
  // },
  // keyboardIcon: {
  //   type: String,
  //   default: '$edit',
  // },
  // inputMode: {
  //   type: String as PropType<'calendar' | 'keyboard'>,
  //   default: 'calendar',
  // },
  // inputText: {
  //   type: String,
  //   default: '$chaos.datePicker.input.placeholder',
  // },
  // inputPlaceholder: {
  //   type: String,
  //   default: 'dd/mm/yyyy',
  // },
  header: {
    type: String,
    default: '$chaos.datePicker.header',
  },

  ...makeCDatePickerControlsProps(),
  ...makeCDatePickerMonthProps({
    weeksInMonth: 'static' as const,
  }),
  ...omit(makeCDatePickerMonthsProps(), ['modelValue']),
  ...omit(makeCDatePickerYearsProps(), ['modelValue']),
  ...makeCPickerProps({ title: '$chaos.datePicker.title' }),

  modelValue: null,
}, 'CDatePicker')

export const CDatePicker = genericComponent<new<
  T,
  Multiple extends boolean | 'range' | number | (string & {}) = false,
  TModel = Multiple extends true | number | string
    ? T[]
    : T,
> (
  props: {
    'modelValue'?: TModel
    'onUpdate:modelValue'?: (value: TModel) => void
    'multiple'?: Multiple
  },
  slots: CDatePickerSlots
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CDatePicker',

  props: makeCDatePickerProps(),

  emits: {
    'update:modelValue': (_date: any) => true,
    'update:month': (_date: any) => true,
    'update:year': (_date: any) => true,
    // 'update:inputMode': (date: any) => true,
    'update:viewMode': (_date: any) => true,
  },

  setup(props, { emit, slots }) {
    const adapter = useDate()
    const { t } = useLocale()

    const model = useProxiedModel(
      props,
      'modelValue',
      undefined,
      v => wrapInArray(v),
      v => props.multiple ? v : v[0],
    )

    const viewMode = useProxiedModel(props, 'viewMode')
    // const inputMode = useProxiedModel(props, 'inputMode')
    const internal = computed(() => {
      const value = adapter.date(model.value?.[0])

      return value && adapter.isValid(value) ? value : adapter.date()
    })

    const month = ref(Number(props.month ?? adapter.getMonth(adapter.startOfMonth(internal.value))))
    const year = ref(Number(props.year ?? adapter.getYear(adapter.startOfYear(adapter.setMonth(internal.value, month.value)))))

    const isReversing = shallowRef(false)
    const header = computed(() => {
      if (props.multiple && model.value.length > 1)
        return t('$chaos.datePicker.itemsSelected', model.value.length)

      return (model.value[0] && adapter.isValid(model.value[0]))
        ? adapter.format(adapter.date(model.value[0]), 'normalDateWithWeekday')
        : t(props.header)
    })
    const text = computed(() => {
      let date = adapter.date()

      date = adapter.setDate(date, 1)
      date = adapter.setMonth(date, month.value)
      date = adapter.setYear(date, year.value)

      return adapter.format(date, 'monthAndYear')
    })
    // const headerIcon = computed(() => props.inputMode === 'calendar' ? props.keyboardIcon : props.calendarIcon)
    const headerTransition = computed(() => `date-picker-header${isReversing.value ? '-reverse' : ''}-transition`)
    const minDate = computed(() => {
      const date = adapter.date(props.min)

      return props.min && adapter.isValid(date) ? date : null
    })
    const maxDate = computed(() => {
      const date = adapter.date(props.max)

      return props.max && adapter.isValid(date) ? date : null
    })
    const disabled = computed(() => {
      if (props.disabled)
        return true

      const targets = []

      if (viewMode.value !== 'month') {
        targets.push(...['prev', 'next'])
      }
      else {
        let _date = adapter.date()

        _date = adapter.setYear(_date, year.value)
        _date = adapter.setMonth(_date, month.value)

        if (minDate.value) {
          const date = adapter.addDays(adapter.startOfMonth(_date), -1)

          adapter.isAfter(minDate.value, date) && targets.push('prev')
        }

        if (maxDate.value) {
          const date = adapter.addDays(adapter.endOfMonth(_date), 1)

          adapter.isAfter(date, maxDate.value) && targets.push('next')
        }
      }

      return targets
    })

    // function onClickAppend () {
    //   inputMode.value = inputMode.value === 'calendar' ? 'keyboard' : 'calendar'
    // }

    function onClickNext() {
      if (month.value < 11) {
        month.value++
      }
      else {
        year.value++
        month.value = 0
        onUpdateYear(year.value)
      }
      onUpdateMonth(month.value)
    }

    function onClickPrev() {
      if (month.value > 0) {
        month.value--
      }
      else {
        year.value--
        month.value = 11
        onUpdateYear(year.value)
      }
      onUpdateMonth(month.value)
    }

    function onClickDate() {
      viewMode.value = 'month'
    }

    function onClickMonth() {
      viewMode.value = viewMode.value === 'months' ? 'month' : 'months'
    }

    function onClickYear() {
      viewMode.value = viewMode.value === 'year' ? 'month' : 'year'
    }

    function onUpdateMonth(value: number) {
      if (viewMode.value === 'months')
        onClickMonth()

      emit('update:month', value)
    }

    function onUpdateYear(value: number) {
      if (viewMode.value === 'year')
        onClickYear()

      emit('update:year', value)
    }

    watch(model, (val, oldVal) => {
      const before = adapter.date(wrapInArray(oldVal)[oldVal.length - 1])
      const after = adapter.date(wrapInArray(val)[val.length - 1])
      const newMonth = adapter.getMonth(after)
      const newYear = adapter.getYear(after)

      if (newMonth !== month.value) {
        month.value = newMonth
        onUpdateMonth(month.value)
      }

      if (newYear !== year.value) {
        year.value = newYear
        onUpdateYear(year.value)
      }

      isReversing.value = adapter.isBefore(before, after)
    })

    useRender(() => {
      const pickerProps = CPicker.filterProps(props)
      const datePickerControlsProps = CDatePickerControls.filterProps(props)
      const datePickerHeaderProps = CDatePickerHeader.filterProps(props)
      const datePickerMonthProps = CDatePickerMonth.filterProps(props)
      const datePickerMonthsProps = omit(CDatePickerMonths.filterProps(props), ['modelValue'])
      const datePickerYearsProps = omit(CDatePickerYears.filterProps(props), ['modelValue'])

      const headerProps = {
        header: header.value,
        transition: headerTransition.value,
      }

      return (
        <CPicker
          {...pickerProps}
          class={[
            'v-date-picker',
            `v-date-picker--${viewMode.value}`,
            {
              'v-date-picker--show-week': props.showWeek,
            },
            props.class,
          ]}
          style={props.style}
          v-slots={{
            title: () => slots.title?.() ?? (
              <div class="v-date-picker__title">
                { t(props.title) }
              </div>
            ),
            header: () => slots.header
              ? (
                <CDefaultsProvider
                  defaults={{
                    CDatePickerHeader: { ...headerProps },
                  }}
                >
                  { slots.header?.(headerProps) }
                </CDefaultsProvider>
                )
              : (
                <CDatePickerHeader
                  key="header"
                  {...datePickerHeaderProps}
                  {...headerProps}
                  onClick={viewMode.value !== 'month' ? onClickDate : undefined}
                  v-slots={{
                    ...slots,
                    default: undefined,
                  }}
                />
                ),
            default: () => (
              <>
                <CDatePickerControls
                  {...datePickerControlsProps}
                  disabled={disabled.value}
                  text={text.value}
                  onClick:next={onClickNext}
                  onClick:prev={onClickPrev}
                  onClick:month={onClickMonth}
                  onClick:year={onClickYear}
                />

                <CFadeTransition hideOnLeave>
                  { viewMode.value === 'months'
                    ? (
                      <CDatePickerMonths
                        key="date-picker-months"
                        {...datePickerMonthsProps}
                        v-model={month.value}
                        onUpdate:modelValue={onUpdateMonth}
                        min={minDate.value}
                        max={maxDate.value}
                      />
                      )
                    : viewMode.value === 'year'
                      ? (
                        <CDatePickerYears
                          key="date-picker-years"
                          {...datePickerYearsProps}
                          v-model={year.value}
                          onUpdate:modelValue={onUpdateYear}
                          min={minDate.value}
                          max={maxDate.value}
                        />
                        )
                      : (
                        <CDatePickerMonth
                          key="date-picker-month"
                          {...datePickerMonthProps}
                          v-model={model.value}
                          v-model:month={month.value}
                          v-model:year={year.value}
                          onUpdate:month={onUpdateMonth}
                          onUpdate:year={onUpdateYear}
                          min={minDate.value}
                          max={maxDate.value}
                        />
                        )}
                </CFadeTransition>
              </>
            ),
            actions: slots.actions,
          }}
        />
      )
    })

    return {}
  },
})

export type CDatePicker = InstanceType<typeof CDatePicker>
