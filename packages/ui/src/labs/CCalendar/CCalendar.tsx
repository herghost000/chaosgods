import './CCalendar.sass'
import { computed } from 'vue'
import { CCalendarDay, makeCCalendarDayProps } from './CCalendarDay'
import { CCalendarHeader, makeCCalendarHeaderProps } from './CCalendarHeader'
import { CCalendarMonthDay } from './CCalendarMonthDay'
import { makeCalendarProps, useCalendar } from '@/composables/calendar'
import { useDate } from '@/composables/date/date'
import { chunkArray, genericComponent, propsFactory, useRender } from '@/util'

export const makeCCalendarProps = propsFactory({
  hideHeader: Boolean,
  hideWeekNumber: Boolean,

  ...makeCalendarProps(),
  ...makeCCalendarDayProps(),
  ...makeCCalendarHeaderProps(),
}, 'CCalender')

export type CCalendarSlots = {
  header: { title: string }
  event: { day?: Object, allDay: boolean, event: Record<string, unknown> }
}

export const CCalendar = genericComponent<CCalendarSlots>()({
  name: 'CCalendar',

  props: makeCCalendarProps(),

  emits: {
    'next': null,
    'prev': null,
    'update:modelValue': null,
  },

  setup(props, { slots }) {
    const adapter = useDate()

    const { daysInMonth, daysInWeek, genDays, model, displayValue, weekNumbers } = useCalendar(props as any)

    const dayNames = adapter.getWeekdays()

    function onClickNext() {
      if (props.viewMode === 'month')
        model.value = [adapter.addMonths(displayValue.value, 1)]

      if (props.viewMode === 'week')
        model.value = [adapter.addDays(displayValue.value, 7)]

      if (props.viewMode === 'day')
        model.value = [adapter.addDays(displayValue.value, 1)]
    }

    function onClickPrev() {
      if (props.viewMode === 'month')
        model.value = [adapter.addMonths(displayValue.value, -1)]

      if (props.viewMode === 'week')
        model.value = [adapter.addDays(displayValue.value, -7)]

      if (props.viewMode === 'day')
        model.value = [adapter.addDays(displayValue.value, -1)]
    }

    function onClickToday() {
      model.value = [new Date()]
    }

    const title = computed(() => {
      return adapter.format(displayValue.value, 'monthAndYear')
    })

    useRender(() => {
      const calendarDayProps = CCalendarDay.filterProps(props)
      const calendarHeaderProps = CCalendarHeader.filterProps(props)

      return (
        <div class={[
          'v-calendar',
          {
            'v-calendar-monthly': props.viewMode === 'month',
            'v-calendar-weekly': props.viewMode === 'week',
            'v-calendar-day': props.viewMode === 'day',
          },
        ]}
        >
          <div>
            { !props.hideHeader && (
              !slots.header
                ? (
                  <CCalendarHeader
                    key="calendar-header"
                    {...calendarHeaderProps}
                    title={title.value}
                    onClick:next={onClickNext}
                    onClick:prev={onClickPrev}
                    onClick:toToday={onClickToday}
                  />
                  )
                : (
                    slots.header({ title: title.value })
                  )
            )}
          </div>

          <div class={['v-calendar__container', `days__${props.weekdays.length}`]}>
            { props.viewMode === 'month' && !props.hideDayHeader && (
              <div
                class={
                  [
                    'v-calendar-weekly__head',
                    `days__${props.weekdays.length}`,
                    ...(!props.hideWeekNumber ? ['v-calendar-weekly__head-weeknumbers'] : []),
                  ]
                }
                key="calenderWeeklyHead"
              >
                { !props.hideWeekNumber ? <div key="weekNumber0" class="v-calendar-weekly__head-weeknumber"></div> : '' }
                {
                  props.weekdays.map(weekday => (
                    <div class={`v-calendar-weekly__head-weekday${!props.hideWeekNumber ? '-with-weeknumber' : ''}`}>
                      { dayNames[weekday] }
                    </div>
                  ))
                }
              </div>
            )}

            { props.viewMode === 'month' && (
              <div
                key="VCalendarMonth"
                class={
                  [
                    'v-calendar-month__days',
                    `days${!props.hideWeekNumber ? '-with-weeknumbers' : ''}__${props.weekdays.length}`,
                    ...(!props.hideWeekNumber ? ['v-calendar-month__weeknumbers'] : []),
                  ]
                }
              >
                { chunkArray(daysInMonth.value, props.weekdays.length)
                  .map((week, wi) => (
                    [
                      !props.hideWeekNumber ? <div class="v-calendar-month__weeknumber">{ weekNumbers.value[wi] }</div> : '',
                      week.map(day => (
                        <CCalendarMonthDay
                          color={adapter.isSameDay(new Date(), day.date) ? 'primary' : undefined}
                          day={day}
                          title={day ? adapter.format(day.date, 'dayOfMonth') : 'NaN'}
                          events={props.events?.filter(e => adapter.isSameDay(day.date, e.start) || adapter.isSameDay(day.date, e.end))}
                          v-slots={{
                            event: slots.event,
                          }}
                        >
                        </CCalendarMonthDay>
                      )),
                    ]
                  ))}
              </div>
            )}

            { props.viewMode === 'week' && (
              daysInWeek.value.map((day, i) => (
                <CCalendarDay
                  {...calendarDayProps}
                  day={day}
                  dayIndex={i}
                  events={props.events?.filter(e => adapter.isSameDay(e.start, day.date) || adapter.isSameDay(e.end, day.date))}
                >
                </CCalendarDay>
              ))
            )}

            { props.viewMode === 'day' && (
              <CCalendarDay
                {...calendarDayProps}
                day={genDays([displayValue.value as Date], adapter.date() as Date)[0]}
                dayIndex={0}
                events={
                  props.events?.filter(e =>
                    adapter.isSameDay(e.start, genDays([displayValue.value as Date], adapter.date() as Date)[0].date)
                    || adapter.isSameDay(e.end, genDays([displayValue.value as Date], adapter.date() as Date)[0].date),
                  )
                }
              >
              </CCalendarDay>
            )}
          </div>
        </div>
      )
    })

    return { daysInMonth, daysInWeek, genDays }
  },
})

export type CCalendar = InstanceType<typeof CCalendar>
