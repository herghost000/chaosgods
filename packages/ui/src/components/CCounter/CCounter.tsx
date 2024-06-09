import './CCounter.sass'
import { computed } from 'vue'
import type { Component } from 'vue'
import { CSlideYTransition } from '@/components/transitions'
import { makeComponentProps } from '@/composables/component'
import { MaybeTransition, makeTransitionProps } from '@/composables/transition'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCCounterProps = propsFactory({
  active: Boolean,
  disabled: Boolean,
  max: [Number, String],
  value: {
    type: [Number, String],
    default: 0,
  },

  ...makeComponentProps(),
  ...makeTransitionProps({
    transition: { component: CSlideYTransition as Component },
  }),
}, 'CCounter')

export type CCounterSlot = {
  counter: string
  max: string | number | undefined
  value: string | number | undefined
}

type CCounterSlots = {
  default: CCounterSlot
}

export const CCounter = genericComponent<CCounterSlots>()({
  name: 'CCounter',

  functional: true,

  props: makeCCounterProps(),

  setup(props, { slots }) {
    const counter = computed(() => {
      return props.max ? `${props.value} / ${props.max}` : String(props.value)
    })

    useRender(() => (
      <MaybeTransition transition={props.transition}>
        <div
          v-show={props.active}
          class={[
            'v-counter',
            {
              'text-error': props.max && !props.disabled
              && Number.parseFloat(`${props.value}`) > Number.parseFloat(`${props.max}`),
            },
            props.class,
          ]}
          style={props.style}
        >
          { slots.default
            ? slots.default({
              counter: counter.value,
              max: props.max,
              value: props.value,
            })
            : counter.value}
        </div>
      </MaybeTransition>
    ))

    return {}
  },
})

export type CCounter = InstanceType<typeof CCounter>
