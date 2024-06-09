import './CCalendarDay.sass'
import { computed } from 'vue'
import { CCalendarInterval, makeCCalendarIntervalProps } from './CCalendarInterval'
import { CBtn } from '@/components/CBtn'
import { useDate } from '@/composables/date'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCalendarDayProps = propsFactory({
  hideDayHeader: Boolean,
  intervals: {
    type: Number,
    default: 24,
  },

  ...makeCCalendarIntervalProps(),
}, 'CCalendarDay')

export const CCalendarDay = genericComponent()({
  name: 'CCalendarDay',

  props: makeCCalendarDayProps(),

  setup(props) {
    const adapter = useDate()
    const intervals = computed(() => [
      ...Array.from({ length: props.intervals }, (_v, i) => i)
        .filter((_int, index) => (props.intervalDuration * (index + props.intervalStart)) < 1440),
    ])

    useRender(() => {
      const calendarIntervalProps = CCalendarInterval.filterProps(props)

      return (
        <div class="v-calendar-day__container">
          { !props.hideDayHeader && (
            <div
              key="calender-week-name"
              class="v-calendar-weekly__head-weekday"
            >
              { adapter.format(props.day.date, 'weekdayShort') }

              <div>
                <CBtn
                  icon
                  text={adapter.format(props.day.date, 'dayOfMonth')}
                  variant="text"
                />
              </div>
            </div>
          )}

          { intervals.value.map((_, index) => (
            <CCalendarInterval
              index={index}
              {...calendarIntervalProps}
            >
            </CCalendarInterval>
          ))}
        </div>
      )
    })

    return { intervals }
  },
})

export type CCalendarDay = InstanceType<typeof CCalendarDay>
