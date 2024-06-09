import { computed, ref, toRaw, watchEffect } from 'vue'
import type { Ref, VNode } from 'vue'
import { CBtn } from '@/components/CBtn'
import { useLocale } from '@/composables'
import { useProxiedModel } from '@/composables/proxiedModel'
import { deepEqual, genericComponent, propsFactory, useRender } from '@/util'
import type { GenericProps } from '@/util'

export type CConfirmEditSlots<T> = {
  default: {
    model: Ref<T>
    save: () => void
    cancel: () => void
    isPristine: boolean
    get actions (): VNode
  }
}

export const makeCConfirmEditProps = propsFactory({
  modelValue: null,
  color: String,
  cancelText: {
    type: String,
    default: '$chaos.confirmEdit.cancel',
  },
  okText: {
    type: String,
    default: '$chaos.confirmEdit.ok',
  },
}, 'CConfirmEdit')

export const CConfirmEdit = genericComponent<new<T> (
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
    'onSave'?: (value: T) => void
  },
  slots: CConfirmEditSlots<T>
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CConfirmEdit',

  props: makeCConfirmEditProps(),

  emits: {
    'cancel': () => true,
    'save': (_value: any) => true,
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { emit, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const internalModel = ref()
    watchEffect(() => {
      internalModel.value = structuredClone(toRaw(model.value))
    })

    const { t } = useLocale()

    const isPristine = computed(() => {
      return deepEqual(model.value, internalModel.value)
    })

    function save() {
      model.value = internalModel.value
      emit('save', internalModel.value)
    }

    function cancel() {
      internalModel.value = structuredClone(toRaw(model.value))
      emit('cancel')
    }

    let actionsUsed = false
    useRender(() => {
      const actions = (
        <>
          <CBtn
            disabled={isPristine.value}
            variant="text"
            color={props.color}
            onClick={cancel}
            text={t(props.cancelText)}
          />

          <CBtn
            disabled={isPristine.value}
            variant="text"
            color={props.color}
            onClick={save}
            text={t(props.okText)}
          />
        </>
      )
      return (
        <>
          {
            slots.default?.({
              model: internalModel,
              save,
              cancel,
              isPristine: isPristine.value,
              get actions() {
                actionsUsed = true
                return actions
              },
            })
          }

          { !actionsUsed && actions }
        </>
      )
    })

    return {
      save,
      cancel,
      isPristine,
    }
  },
})

export type CConfirmEdit = InstanceType<typeof CConfirmEdit>
