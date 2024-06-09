import './CMessages.sass'
import { computed } from 'vue'
import type { Component, PropType } from 'vue'
import { CSlideYTransition } from '@/components/transitions'
import { useTextColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { MaybeTransition, makeTransitionProps } from '@/composables/transition'
import { genericComponent, propsFactory, useRender, wrapInArray } from '@/util'

export type CMessageSlot = {
  message: string
}

export type CMessagesSlots = {
  message: CMessageSlot
}

export const makeCMessagesProps = propsFactory({
  active: Boolean,
  color: String,
  messages: {
    type: [Array, String] as PropType<string | readonly string[]>,
    default: () => ([]),
  },

  ...makeComponentProps(),
  ...makeTransitionProps({
    transition: {
      component: CSlideYTransition as Component,
      leaveAbsolute: true,
      group: true,
    },
  }),
}, 'CMessages')

export const CMessages = genericComponent<CMessagesSlots>()({
  name: 'CMessages',

  props: makeCMessagesProps(),

  setup(props, { slots }) {
    const messages = computed(() => wrapInArray(props.messages))
    const { textColorClasses, textColorStyles } = useTextColor(computed(() => props.color))

    useRender(() => (
      <MaybeTransition
        transition={props.transition}
        tag="div"
        class={[
          'v-messages',
          textColorClasses.value,
          props.class,
        ]}
        style={[
          textColorStyles.value,
          props.style,
        ]}
        role="alert"
        aria-live="polite"
      >
        { props.active && (
          messages.value.map((message, i) => (
            <div
              class="v-messages__message"
              key={`${i}-${messages.value}`}
            >
              { slots.message ? slots.message({ message }) : message }
            </div>
          ))
        )}
      </MaybeTransition>
    ))

    return {}
  },
})

export type CMessages = InstanceType<typeof CMessages>
