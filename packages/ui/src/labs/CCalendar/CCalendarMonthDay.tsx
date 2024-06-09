import './CCalendarMonthDay.sass'
import { CCalendarEvent } from './CCalendarEvent'
import { CBtn } from '@/components/CBtn'
import { genericComponent, propsFactory, useRender } from '@/util'

export type CCalendarMonthDaySlots = {
  default: never
  content: never
  title: { title?: number | string }
  event: { day?: Object, allDay: boolean, event: Record<string, unknown> }
}

export const makeCCalendarMonthDayProps = propsFactory({
  active: Boolean,
  color: String,
  day: Object,
  disabled: Boolean,
  events: Array<any>,
  title: [Number, String],
}, 'CCalendarMonthDay')

export const CCalendarMonthDay = genericComponent<CCalendarMonthDaySlots>()({
  name: 'CCalendarMonthDay',

  props: makeCCalendarMonthDayProps(),

  setup(props, { slots }) {
    useRender(() => {
      const hasTitle = !!(props.title || slots.title?.({ title: props.title }))

      return (
        <div
          class={[
            'v-calendar-month__day',
          ]}
        >
          { !props.day?.isHidden && hasTitle && (
            <div key="title" class="v-calendar-weekly__day-label">
              { slots.title?.({ title: props.title }) ?? (
                <CBtn
                  class={props.day?.isToday ? 'v-calendar-weekly__day-label__today' : undefined}
                  color={props.color}
                  disabled={props.disabled}
                  icon
                  size="x-small"
                  variant={props.day?.isToday ? undefined : 'flat'}
                >
                  { props.title }
                </CBtn>
              )}
            </div>
          )}

          { !props.day?.isHidden && (
            <div key="content" class="v-calendar-weekly__day-content">
              { slots.content?.() ?? (
                <div>
                  <div class="v-calendar-weekly__day-alldayevents-container">
                    { props.events?.filter(event => event.allDay).map(event => slots.event
                      ? slots.event({ day: props.day, allDay: true, event })
                      : (
                        <CCalendarEvent day={props.day} event={event} allDay />
                        ))}
                  </div>

                  <div class="v-calendar-weekly__day-events-container">
                    { props.events?.filter(event => !event.allDay).map(event => slots.event
                      ? slots.event({ day: props.day, event, allDay: false })
                      : (
                        <CCalendarEvent day={props.day} event={event} />
                        ))}
                  </div>
                </div>
              )}
            </div>
          )}

          { !props.day?.isHidden && slots.default?.() }
        </div>
      )
    })

    return {}
  },
})

export type CCalendarMonthDay = InstanceType<typeof CCalendarMonthDay>
