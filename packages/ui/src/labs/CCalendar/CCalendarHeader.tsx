import './CCalendarHeader.sass'
import type { PropType } from 'vue'
import { CBtn } from '@/components/CBtn'
import { useLocale } from '@/composables/locale'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCalendarHeaderProps = propsFactory({
  nextIcon: {
    type: String,
    default: '$next',
  },
  prevIcon: {
    type: String,
    default: '$prev',
  },
  title: String,
  text: {
    type: String,
    default: '$vuetify.calendar.today',
  },
  viewMode: {
    type: String as PropType<'month' | 'week' | 'day'>,
    default: 'month',
  },
}, 'CCalendarHeader')

export const CCalendarHeader = genericComponent()({
  name: 'CCalendarHeader',

  props: makeCCalendarHeaderProps(),

  emits: {
    'click:next': () => true,
    'click:prev': () => true,
    'click:toToday': () => true,
  },

  setup(props, { emit }) {
    const { t } = useLocale()

    function prev() {
      emit('click:prev')
    }

    function next() {
      emit('click:next')
    }

    function toToday() {
      emit('click:toToday')
    }

    useRender(() => (
      <div class="v-calendar-header">
        { props.text && (
          <CBtn
            key="today"
            class="v-calendar-header__today"
            text={t(props.text)}
            variant="outlined"
            onClick={toToday}
          />
        )}

        <CBtn
          density="comfortable"
          icon={props.prevIcon}
          variant="text"
          onClick={prev}
        />

        <CBtn
          density="comfortable"
          icon={props.nextIcon}
          variant="text"
          onClick={next}
        />

        <div class="v-calendar-header__title">{ props.title }</div>
      </div>
    ))

    return {}
  },
})

export type CCalendarHeader = InstanceType<typeof CCalendarHeader>
