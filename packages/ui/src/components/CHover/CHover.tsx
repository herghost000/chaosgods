import { makeDelayProps, useDelay } from '@/composables/delay'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, propsFactory } from '@/util'

type CHoverSlots = {
  default: {
    isHovering: boolean | null
    props: Record<string, unknown>
  }
}

export const makeCHoverProps = propsFactory({
  disabled: Boolean,
  modelValue: {
    type: Boolean,
    default: null,
  },

  ...makeDelayProps(),
}, 'CHover')

export const CHover = genericComponent<CHoverSlots>()({
  name: 'CHover',

  props: makeCHoverProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const isHovering = useProxiedModel(props, 'modelValue')
    const { runOpenDelay, runCloseDelay } = useDelay(props, value => !props.disabled && (isHovering.value = value))

    return () => slots.default?.({
      isHovering: isHovering.value,
      props: {
        onMouseenter: runOpenDelay,
        onMouseleave: runCloseDelay,
      },
    })
  },
})

export type CHover = InstanceType<typeof CHover>
