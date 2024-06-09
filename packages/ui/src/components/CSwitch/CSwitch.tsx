import './CSwitch.sass'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { CScaleTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider/CDefaultsProvider'
import { CIcon } from '@/components/CIcon'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { CProgressCircular } from '@/components/CProgressCircular'
import { CSelectionControl, makeCSelectionControlProps } from '@/components/CSelectionControl/CSelectionControl'
import { useFocus } from '@/composables/focus'
import { LoaderSlot, useLoader } from '@/composables/loader'
import { useProxiedModel } from '@/composables/proxiedModel'
import { IN_BROWSER, filterInputAttrs, genericComponent, getUid, propsFactory, useRender } from '@/util'
import type { CInputSlots } from '@/components/CInput/CInput'
import type { CSelectionControlSlots } from '@/components/CSelectionControl/CSelectionControl'
import type { IconValue } from '@/composables/icons'
import type { LoaderSlotProps } from '@/composables/loader'
import type { GenericProps } from '@/util'

export type CSwitchSlot = {
  model: Ref<boolean>
  isValid: ComputedRef<boolean | null>
}

export type CSwitchSlots =
  & CInputSlots
  & CSelectionControlSlots
  & {
    'loader': LoaderSlotProps
    'thumb': { icon: IconValue | undefined } & CSwitchSlot
    'track-false': CSwitchSlot
    'track-true': CSwitchSlot
  }

export const makeCSwitchProps = propsFactory({
  indeterminate: Boolean,
  inset: Boolean,
  flat: Boolean,
  loading: {
    type: [Boolean, String],
    default: false,
  },

  ...makeCInputProps(),
  ...makeCSelectionControlProps(),
}, 'CSwitch')

export const CSwitch = genericComponent<new<T>(
  props: {
    'modelValue'?: T | null
    'onUpdate:modelValue'?: (value: T | null) => void
  },
  slots: CSwitchSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CSwitch',

  inheritAttrs: false,

  props: makeCSwitchProps(),

  emits: {
    'update:focused': (_focused: boolean) => true,
    'update:modelValue': (_value: any) => true,
    'update:indeterminate': (_value: boolean) => true,
  },

  setup(props, { attrs, slots }) {
    const indeterminate = useProxiedModel(props, 'indeterminate')
    const model = useProxiedModel(props, 'modelValue')
    const { loaderClasses } = useLoader(props)
    const { isFocused, focus, blur } = useFocus(props)
    const control = ref<CSelectionControl>()
    const isForcedColorsModeActive = IN_BROWSER && window.matchMedia('(forced-colors: active)').matches

    const loaderColor = computed(() => {
      return typeof props.loading === 'string' && props.loading !== ''
        ? props.loading
        : props.color
    })

    const uid = getUid()
    const id = computed(() => props.id || `switch-${uid}`)

    function onChange() {
      if (indeterminate.value)
        indeterminate.value = false
    }
    function onTrackClick(e: Event) {
      e.stopPropagation()
      e.preventDefault()
      control.value?.input?.click()
    }

    useRender(() => {
      const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)
      const inputProps = CInput.filterProps(props)
      const controlProps = CSelectionControl.filterProps(props)

      return (
        <CInput
          class={[
            'v-switch',
            { 'v-switch--flat': props.flat },
            { 'v-switch--inset': props.inset },
            { 'v-switch--indeterminate': indeterminate.value },
            loaderClasses.value,
            props.class,
          ]}
          {...rootAttrs}
          {...inputProps}
          v-model={model.value}
          id={id.value}
          focused={isFocused.value}
          style={props.style}
        >
          {{
            ...slots,
            default: ({
              id,
              messagesId,
              isDisabled,
              isReadonly,
              isValid,
            }) => {
              const slotProps = {
                model,
                isValid,
              }

              return (
                <CSelectionControl
                  ref={control}
                  {...controlProps}
                  v-model={model.value}
                  id={id.value}
                  aria-describedby={messagesId.value}
                  type="checkbox"
                  onUpdate:modelValue={onChange}
                  aria-checked={indeterminate.value ? 'mixed' : undefined}
                  disabled={isDisabled.value}
                  readonly={isReadonly.value}
                  onFocus={focus}
                  onBlur={blur}
                  {...controlAttrs}
                >
                  {{
                    ...slots,
                    default: ({ backgroundColorClasses, backgroundColorStyles }) => (
                      <div
                        class={[
                          'v-switch__track',
                          !isForcedColorsModeActive ? backgroundColorClasses.value : undefined,
                        ]}
                        style={backgroundColorStyles.value}
                        onClick={onTrackClick}
                      >
                        { slots['track-true'] && (
                          <div key="prepend" class="v-switch__track-true">
                            { slots['track-true'](slotProps) }
                          </div>
                        )}

                        { slots['track-false'] && (
                          <div key="append" class="v-switch__track-false">
                            { slots['track-false'](slotProps) }
                          </div>
                        )}
                      </div>
                    ),
                    input: ({ inputNode, icon, backgroundColorClasses, backgroundColorStyles }) => (
                      <>
                        { inputNode }
                        <div
                          class={[
                            'v-switch__thumb',
                            { 'v-switch__thumb--filled': icon || props.loading },
                            props.inset || isForcedColorsModeActive ? undefined : backgroundColorClasses.value,
                          ]}
                          style={props.inset ? undefined : backgroundColorStyles.value}
                        >
                          { slots.thumb
                            ? (
                              <CDefaultsProvider
                                defaults={{
                                  CIcon: {
                                    icon,
                                    size: 'x-small',
                                  },
                                }}
                              >
                                { slots.thumb({ ...slotProps, icon }) }
                              </CDefaultsProvider>
                              )
                            : (
                              <CScaleTransition>
                                { !props.loading
                                  ? (
                                      (icon && (
                                        <CIcon
                                          key={String(icon)}
                                          icon={icon}
                                          size="x-small"
                                        />
                                      )))
                                  : (
                                    <LoaderSlot
                                      name="v-switch"
                                      active
                                      color={isValid.value === false ? undefined : loaderColor.value}
                                    >
                                      { slotProps => (
                                        slots.loader
                                          ? slots.loader(slotProps)
                                          : (
                                            <CProgressCircular
                                              active={slotProps.isActive}
                                              color={slotProps.color}
                                              indeterminate
                                              size="16"
                                              width="2"
                                            />
                                            )
                                      )}
                                    </LoaderSlot>
                                    )}
                              </CScaleTransition>
                              )}
                        </div>
                      </>
                    ),
                  }}
                </CSelectionControl>
              )
            },
          }}
        </CInput>
      )
    })

    return {}
  },
})

export type CSwitch = InstanceType<typeof CSwitch>
