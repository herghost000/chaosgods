import { CBadge } from '@/components/CBadge'
import { CChip } from '@/components/CChip'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCalendarEventProps = propsFactory({
  allDay: Boolean,
  day: Object,
  event: Object,
}, 'CCalendarEvent')

export const CCalendarEvent = genericComponent()({
  name: 'CCalendarEvent',

  props: makeCCalendarEventProps(),

  setup(props) {
    useRender(() => (
      <CChip
        color={props.allDay ? 'primary' : undefined}
        density="comfortable"
        label={props.allDay}
        width="100%"
      >
        <CBadge
          inline
          dot
          color={props.event?.color}
        />

        { props.event?.title }
      </CChip>
    ))

    return {}
  },

})

export type CCalendarEvent = InstanceType<typeof CCalendarEvent>
