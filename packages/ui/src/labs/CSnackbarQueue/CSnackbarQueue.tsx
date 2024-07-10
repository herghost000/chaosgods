import { computed, nextTick, shallowRef, watch } from 'vue'
import type { PropType } from 'vue'
import { CBtn } from '@/components/CBtn'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CSnackbar, makeCSnackbarProps } from '@/components/CSnackbar/CSnackbar'
import { useLocale } from '@/composables/locale'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { GenericProps } from '@/util'

export type CSnackbarQueueSlots<T extends string | SnackbarMessage> = {
  default: { item: T }
  text: { item: T }
  actions: {
    item: T
    props: {
      onClick: () => void
    }
  }
}

export type SnackbarMessage = Omit<
  CSnackbar['$props'],
  | '$children'
  | 'modelValue'
  | 'onUpdate:modelValue'
  | 'activator'
  | 'activatorProps'
  | 'closeDelay'
  | 'openDelay'
  | 'openOnClick'
  | 'openOnFocus'
  | 'openOnHover'
>

export const makeCSnackbarQueueProps = propsFactory({
  // TODO: Port this to Snackbar on dev
  closable: [Boolean, String],
  closeText: {
    type: String,
    default: '$chaos.dismiss',
  },
  modelValue: {
    type: Array as PropType<readonly (string | SnackbarMessage)[]>,
    default: () => [],
  },

  ...omit(makeCSnackbarProps(), ['modelValue']),
}, 'CSnackbarQueue')

export const CSnackbarQueue = genericComponent<new<T extends readonly (string | SnackbarMessage)[]> (
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (val: T) => void
  },
  slots: CSnackbarQueueSlots<T[number]>,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CSnackbarQueue',

  props: makeCSnackbarQueueProps(),

  emits: {
    'update:modelValue': (_val: (string | SnackbarMessage)[]) => true,
  },

  setup(props, { emit, slots }) {
    const { t } = useLocale()

    const isActive = shallowRef(false)
    const isVisible = shallowRef(false)
    const current = shallowRef<SnackbarMessage>()

    watch(() => props.modelValue.length, (val, oldVal) => {
      if (!isVisible.value && val > oldVal)
        showNext()
    })
    watch(isActive, (val) => {
      if (val)
        isVisible.value = true
    })

    function onAfterLeave() {
      if (props.modelValue.length) {
        showNext()
      }
      else {
        current.value = undefined
        isVisible.value = false
      }
    }
    function showNext() {
      const [next, ...rest] = props.modelValue
      emit('update:modelValue', rest)
      current.value = typeof next === 'string' ? { text: next } : next
      nextTick(() => {
        isActive.value = true
      })
    }
    function onClickClose() {
      isActive.value = false
    }

    const btnProps = computed(() => ({
      color: typeof props.closable === 'string' ? props.closable : undefined,
      text: t(props.closeText),
    }))

    useRender(() => {
      const hasActions = !!(props.closable || slots.actions)
      const { modelValue: _, ...snackbarProps } = CSnackbar.filterProps(props as any)

      return (
        <>
          { isVisible.value && !!current.value && (
            slots.default
              ? (
                <CDefaultsProvider defaults={{ CSnackbar: current.value }}>
                  { slots.default({ item: current.value }) }
                </CDefaultsProvider>
                )
              : (
                <CSnackbar
                  {...snackbarProps}
                  {...current.value}
                  v-model={isActive.value}
                  onAfterLeave={onAfterLeave}
                >
                  {{
                    text: slots.text ? () => slots.text?.({ item: current.value! }) : undefined,
                    actions: hasActions
                      ? () => (
                        <>
                          { !slots.actions
                            ? (
                              <CBtn
                                {...btnProps.value}
                                onClick={onClickClose}
                              />
                              )
                            : (
                              <CDefaultsProvider
                                defaults={{
                                  CBtn: btnProps.value,
                                }}
                              >
                                { slots.actions({
                                  item: current.value!,
                                  props: { onClick: onClickClose },
                                })}
                              </CDefaultsProvider>
                              )}
                        </>
                        )
                      : undefined,
                  }}
                </CSnackbar>
                )
          )}
        </>
      )
    })
  },
})

export type CSnackbarQueue = InstanceType<typeof CSnackbarQueue>
