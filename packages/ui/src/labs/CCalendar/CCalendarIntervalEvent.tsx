import './CCalendarIntervalEvent.sass'
import { CSheet } from '@/components/CSheet'
import { useDate } from '@/composables/date'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

export const makeCCalendarIntervalEventPropsa = propsFactory({
  allDay: Boolean,
  interval: Object,
  intervalDivisions: {
    type: Number,
    required: true,
  },
  intervalDuration: {
    type: Number,
    required: true,
  },
  intervalHeight: {
    type: Number,
    required: true,
  },
  event: Object,
}, 'CCalendarIntervalEvent')

export const CCalendarIntervalEvent = genericComponent()({
  name: 'CCalendarIntervalEvent',

  props: makeCCalendarIntervalEventPropsa(),

  setup(props) {
    const adapter = useDate()
    const calcHeight = () => {
      if ((!props.event?.first && !props.event?.last) || adapter.isEqual(props.event?.start, props.interval?.start)) {
        return { height: '100%', margin: convertToUnit(0) }
      }
      else {
        const { height, margin } = Array.from({ length: props.intervalDivisions }, (x: number) => x * (props.intervalDuration / props.intervalDivisions)).reduce((total, div, index) => {
          if (adapter.isBefore(adapter.addMinutes(props.interval?.start, div), props.event?.start)) {
            return {
              height: convertToUnit((props.intervalHeight / props.intervalDivisions) * index),
              margin: convertToUnit((props.intervalHeight / props.intervalDivisions) * index),
            }
          }
          return { height: total.height, margin: total.margin }
        }, { height: '', margin: '' })
        return { height, margin }
      }
    }

    useRender(() => {
      return (
        <CSheet
          height={calcHeight().height}
          density="comfortable"
          style={`margin-top: ${calcHeight().margin}`}
          class="v-calendar-internal-event"
          color={props.event?.color ?? undefined}
          rounded={props.event?.first && props.event?.last
            ? true
            : props.event?.first
              ? 't'
              : props.event?.last
                ? 'b'
                : false}
        >
          { props.event?.first ? props.event?.title : '' }
        </CSheet>
      )
    })

    return {}
  },

})

export type CCalendarIntervalEvent = InstanceType<typeof CCalendarIntervalEvent>
