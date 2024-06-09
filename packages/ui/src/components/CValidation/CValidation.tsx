import { makeValidationProps, useValidation } from '@/composables/validation'
import { genericComponent } from '@/util'
import type { GenericProps } from '@/util'

export type CValidationSlots = {
  default: ReturnType<typeof useValidation>
}

export const CValidation = genericComponent<new<T>(
  props: {
    'modelValue'?: T | null
    'onUpdate:modelValue'?: (value: T | null) => void
  },
  slots: CValidationSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CValidation',

  props: makeValidationProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { slots }) {
    const validation = useValidation(props, 'validation')

    return () => slots.default?.(validation)
  },
})

export type CValidation = InstanceType<typeof CValidation>
