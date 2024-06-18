import './CTextField.sass'
import { cloneVNode, computed, nextTick, ref } from 'vue'
import type { PropType } from 'vue'
import { CCounter } from '@/components/CCounter/CCounter'
import { CField, filterFieldProps, makeCFieldProps } from '@/components/CField/CField'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { useFocus } from '@/composables/focus'
import { forwardRefs } from '@/composables/forwardRefs'
import { useProxiedModel } from '@/composables/proxiedModel'
import Intersect from '@/directives/intersect'
import { callEvent, filterInputAttrs, genericComponent, propsFactory, useRender } from '@/util'
import type { CCounterSlot } from '@/components/CCounter/CCounter'
import type { CFieldSlots } from '@/components/CField/CField'
import type { CInputSlots } from '@/components/CInput/CInput'

const activeTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']

export const makeCTextFieldProps = propsFactory({
  autofocus: Boolean,
  counter: [Boolean, Number, String],
  counterValue: [Number, Function] as PropType<number | ((value: any) => number)>,
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  suffix: String,
  role: String,
  type: {
    type: String,
    default: 'text',
  },
  modelModifiers: Object as PropType<Record<string, boolean>>,

  ...makeCInputProps(),
  ...makeCFieldProps(),
}, 'CTextField')

export type CTextFieldSlots = Omit<CInputSlots & CFieldSlots, 'default'> & {
  default: never
  counter: CCounterSlot
}

export const CTextField = genericComponent<CTextFieldSlots>()({
  name: 'CTextField',

  directives: { Intersect },

  inheritAttrs: false,

  props: makeCTextFieldProps(),

  emits: {
    'click:control': (_e: MouseEvent) => true,
    'mousedown:control': (_e: MouseEvent) => true,
    'update:focused': (_focused: boolean) => true,
    'update:modelValue': (_val: string) => true,
  },

  setup(props, { attrs, emit, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const { isFocused, focus, blur } = useFocus(props)
    const counterValue = computed(() => {
      return typeof props.counterValue === 'function'
        ? props.counterValue(model.value)
        : typeof props.counterValue === 'number'
          ? props.counterValue
          : (model.value ?? '').toString().length
    })
    const max = computed(() => {
      if (attrs.maxlength)
        return attrs.maxlength as unknown as undefined

      if (
        !props.counter
        || (typeof props.counter !== 'number'
        && typeof props.counter !== 'string')
      ) return undefined

      return props.counter
    })

    const isPlainOrUnderlined = computed(() => ['plain', 'underlined'].includes(props.variant))

    function onIntersect(
      isIntersecting: boolean,
      entries: IntersectionObserverEntry[],
    ) {
      if (!props.autofocus || !isIntersecting)
        return

      (entries[0].target as HTMLInputElement)?.focus?.()
    }

    const vInputRef = ref<CInput>()
    const vFieldRef = ref<CField>()
    const inputRef = ref<HTMLInputElement>()
    const isActive = computed(() => (
      activeTypes.includes(props.type)
      || props.persistentPlaceholder
      || isFocused.value
      || props.active
    ))
    function onFocus() {
      if (inputRef.value !== document.activeElement)
        inputRef.value?.focus()

      if (!isFocused.value)
        focus()
    }
    function onControlMousedown(e: MouseEvent) {
      emit('mousedown:control', e)

      if (e.target === inputRef.value)
        return

      onFocus()
      e.preventDefault()
    }
    function onControlClick(e: MouseEvent) {
      onFocus()

      emit('click:control', e)
    }
    function onClear(e: MouseEvent) {
      e.stopPropagation()

      onFocus()

      nextTick(() => {
        model.value = null

        callEvent(props['onClick:clear'], e)
      })
    }
    function onInput(e: Event) {
      const el = e.target as HTMLInputElement
      model.value = el.value
      if (
        props.modelModifiers?.trim
        && ['text', 'search', 'password', 'tel', 'url'].includes(props.type)
      ) {
        const caretPosition = [el.selectionStart, el.selectionEnd]
        nextTick(() => {
          el.selectionStart = caretPosition[0]
          el.selectionEnd = caretPosition[1]
        })
      }
    }

    useRender(() => {
      const hasCounter = !!(slots.counter || (props.counter !== false && props.counter != null))
      const hasDetails = !!(hasCounter || slots.details)
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)
      const { modelValue: _, ...inputProps } = CInput.filterProps(props)
      const fieldProps = filterFieldProps(props)

      return (
        <CInput
          ref={vInputRef}
          v-model={model.value}
          class={[
            'v-text-field',
            {
              'v-text-field--prefixed': props.prefix,
              'v-text-field--suffixed': props.suffix,
              'v-input--plain-underlined': isPlainOrUnderlined.value,
            },
            props.class,
          ]}
          style={props.style}
          {...rootAttrs}
          {...inputProps}
          centerAffix={!isPlainOrUnderlined.value}
          focused={isFocused.value}
        >
          {{
            ...slots,
            default: ({
              id,
              isDisabled,
              isDirty,
              isReadonly,
              isValid,
            }) => (
              <CField
                ref={vFieldRef}
                onMousedown={onControlMousedown}
                onClick={onControlClick}
                onClick:clear={onClear}
                onClick:prependInner={props['onClick:prependInner']}
                onClick:appendInner={props['onClick:appendInner']}
                role={props.role}
                {...fieldProps}
                id={id.value}
                active={isActive.value || isDirty.value}
                dirty={isDirty.value || props.dirty}
                disabled={isDisabled.value}
                focused={isFocused.value}
                error={isValid.value === false}
              >
                {{
                  ...slots,
                  default: ({
                    props: { class: fieldClass, ...slotProps },
                  }) => {
                    const inputNode = (
                      <input
                        ref={inputRef}
                        value={model.value}
                        onInput={onInput}
                        v-intersect={[{
                          handler: onIntersect,
                        }, null, ['once']]}
                        autofocus={props.autofocus}
                        readonly={isReadonly.value}
                        disabled={isDisabled.value}
                        name={props.name}
                        placeholder={props.placeholder}
                        size={1}
                        type={props.type}
                        onFocus={onFocus}
                        onBlur={blur}
                        {...slotProps}
                        {...inputAttrs}
                      />
                    )

                    return (
                      <>
                        { props.prefix && (
                          <span class="v-text-field__prefix">
                            <span class="v-text-field__prefix__text">
                              { props.prefix }
                            </span>
                          </span>
                        )}

                        { slots.default
                          ? (
                            <div
                              class={fieldClass}
                              data-no-activator=""
                            >
                              { slots.default() }
                              { inputNode }
                            </div>
                            )
                          : cloneVNode(inputNode, { class: fieldClass })}

                        { props.suffix && (
                          <span class="v-text-field__suffix">
                            <span class="v-text-field__suffix__text">
                              { props.suffix }
                            </span>
                          </span>
                        )}
                      </>
                    )
                  },
                }}
              </CField>
            ),
            details: hasDetails
              ? slotProps => (
                <>
                  { slots.details?.(slotProps) }

                  { hasCounter && (
                    <>
                      <span />

                      <CCounter
                        active={props.persistentCounter || isFocused.value}
                        value={counterValue.value}
                        max={max.value}
                        disabled={props.disabled}
                        v-slots:default={slots.counter}
                      />
                    </>
                  )}
                </>
              )
              : undefined,
          }}
        </CInput>
      )
    })

    return forwardRefs({}, vInputRef, vFieldRef, inputRef)
  },
})

export type CTextField = InstanceType<typeof CTextField>