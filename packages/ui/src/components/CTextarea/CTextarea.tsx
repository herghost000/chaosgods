import './CTextarea.sass'
import '../CTextField/CTextField.sass'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { CCounter } from '@/components/CCounter/CCounter'
import { CField } from '@/components/CField'
import { filterFieldProps, makeCFieldProps } from '@/components/CField/CField'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { useFocus } from '@/composables/focus'
import { forwardRefs } from '@/composables/forwardRefs'
import { useProxiedModel } from '@/composables/proxiedModel'
import Intersect from '@/directives/intersect'
import { callEvent, clamp, convertToUnit, filterInputAttrs, genericComponent, propsFactory, useRender } from '@/util'
import type { CCounterSlot } from '@/components/CCounter/CCounter'
import type { CFieldSlots } from '@/components/CField/CField'
import type { CInputSlots } from '@/components/CInput/CInput'

export const makeCTextareaProps = propsFactory({
  autoGrow: Boolean,
  autofocus: Boolean,
  counter: [Boolean, Number, String] as PropType<true | number | string>,
  counterValue: Function as PropType<(value: any) => number>,
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  noResize: Boolean,
  rows: {
    type: [Number, String],
    default: 5,
    validator: (v: any) => !Number.isNaN(Number.parseFloat(v)),
  },
  maxRows: {
    type: [Number, String],
    validator: (v: any) => !Number.isNaN(Number.parseFloat(v)),
  },
  suffix: String,
  modelModifiers: Object as PropType<Record<string, boolean>>,

  ...makeCInputProps(),
  ...makeCFieldProps(),
}, 'CTextarea')

type CTextareaSlots = Omit<CInputSlots & CFieldSlots, 'default'> & {
  counter: CCounterSlot
}

export const CTextarea = genericComponent<CTextareaSlots>()({
  name: 'CTextarea',

  directives: { Intersect },

  inheritAttrs: false,

  props: makeCTextareaProps(),

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
        : (model.value || '').toString().length
    })
    const max = computed(() => {
      if (attrs.maxlength)
        return attrs.maxlength as string | number

      if (
        !props.counter
        || (typeof props.counter !== 'number'
        && typeof props.counter !== 'string')
      ) return undefined

      return props.counter
    })

    function onIntersect(
      isIntersecting: boolean,
      entries: IntersectionObserverEntry[],
    ) {
      if (!props.autofocus || !isIntersecting)
        return

      (entries[0].target as HTMLInputElement)?.focus?.()
    }

    const vInputRef = ref<CInput>()
    const vFieldRef = ref<CInput>()
    const controlHeight = shallowRef('')
    const textareaRef = ref<HTMLInputElement>()
    const isActive = computed(() => (
      props.persistentPlaceholder
      || isFocused.value
      || props.active
    ))

    function onFocus() {
      if (textareaRef.value !== document.activeElement)
        textareaRef.value?.focus()

      if (!isFocused.value)
        focus()
    }
    function onControlClick(e: MouseEvent) {
      onFocus()

      emit('click:control', e)
    }
    function onControlMousedown(e: MouseEvent) {
      emit('mousedown:control', e)
    }
    function onClear(e: MouseEvent) {
      e.stopPropagation()

      onFocus()

      nextTick(() => {
        model.value = ''

        callEvent(props['onClick:clear'], e)
      })
    }
    function onInput(e: Event) {
      const el = e.target as HTMLTextAreaElement
      model.value = el.value
      if (props.modelModifiers?.trim) {
        const caretPosition = [el.selectionStart, el.selectionEnd]
        nextTick(() => {
          el.selectionStart = caretPosition[0]
          el.selectionEnd = caretPosition[1]
        })
      }
    }

    const sizerRef = ref<HTMLTextAreaElement>()
    const rows = ref(+props.rows)
    const isPlainOrUnderlined = computed(() => ['plain', 'underlined'].includes(props.variant))
    watchEffect(() => {
      if (!props.autoGrow)
        rows.value = +props.rows
    })
    function calculateInputHeight() {
      if (!props.autoGrow)
        return

      nextTick(() => {
        if (!sizerRef.value || !vFieldRef.value)
          return

        const style = getComputedStyle(sizerRef.value)
        const fieldStyle = getComputedStyle(vFieldRef.value.$el)

        const padding = Number.parseFloat(style.getPropertyValue('--v-field-padding-top'))
          + Number.parseFloat(style.getPropertyValue('--v-input-padding-top'))
          + Number.parseFloat(style.getPropertyValue('--v-field-padding-bottom'))

        const height = sizerRef.value.scrollHeight
        const lineHeight = Number.parseFloat(style.lineHeight)
        const minHeight = Math.max(
          Number.parseFloat(`${props.rows}`) * lineHeight + padding,
          Number.parseFloat(fieldStyle.getPropertyValue('--v-input-control-height')),
        )
        const maxHeight = Number.parseFloat(`${props.maxRows!}`) * lineHeight + padding || Number.POSITIVE_INFINITY
        const newHeight = clamp(height ?? 0, minHeight, maxHeight)
        rows.value = Math.floor((newHeight - padding) / lineHeight)

        controlHeight.value = convertToUnit(newHeight)
      })
    }

    onMounted(calculateInputHeight)
    watch(model, calculateInputHeight)
    watch(() => props.rows, calculateInputHeight)
    watch(() => props.maxRows, calculateInputHeight)
    watch(() => props.density, calculateInputHeight)

    let observer: ResizeObserver | undefined
    watch(sizerRef, (val) => {
      if (val) {
        observer = new ResizeObserver(calculateInputHeight)
        observer.observe(sizerRef.value!)
      }
      else {
        observer?.disconnect()
      }
    })
    onBeforeUnmount(() => {
      observer?.disconnect()
    })

    useRender(() => {
      const hasCounter = !!(slots.counter || props.counter || props.counterValue)
      const hasDetails = !!(hasCounter || slots.details)
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)
      const { modelValue: _, ...inputProps } = CInput.filterProps(props)
      const fieldProps = filterFieldProps(props)

      return (
        <CInput
          ref={vInputRef}
          v-model={model.value}
          class={[
            'v-textarea v-text-field',
            {
              'v-textarea--prefixed': props.prefix,
              'v-textarea--suffixed': props.suffix,
              'v-text-field--prefixed': props.prefix,
              'v-text-field--suffixed': props.suffix,
              'v-textarea--auto-grow': props.autoGrow,
              'v-textarea--no-resize': props.noResize || props.autoGrow,
              'v-input--plain-underlined': isPlainOrUnderlined.value,
            },
            props.class,
          ]}
          style={props.style}
          {...rootAttrs}
          {...inputProps}
          centerAffix={rows.value === 1 && !isPlainOrUnderlined.value}
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
                style={{
                  '--v-textarea-control-height': controlHeight.value,
                }}
                onClick={onControlClick}
                onMousedown={onControlMousedown}
                onClick:clear={onClear}
                onClick:prependInner={props['onClick:prependInner']}
                onClick:appendInner={props['onClick:appendInner']}
                {...fieldProps}
                id={id.value}
                active={isActive.value || isDirty.value}
                centerAffix={rows.value === 1 && !isPlainOrUnderlined.value}
                dirty={isDirty.value || props.dirty}
                disabled={isDisabled.value}
                focused={isFocused.value}
                error={isValid.value === false}
              >
                {{
                  ...slots,
                  default: ({
                    props: { class: fieldClass, ...slotProps },
                  }) => (
                    <>
                      { props.prefix && (
                        <span class="v-text-field__prefix">
                          { props.prefix }
                        </span>
                      )}

                      <textarea
                        ref={textareaRef}
                        class={fieldClass}
                        value={model.value}
                        onInput={onInput}
                        v-intersect={[{
                          handler: onIntersect,
                        }, null, ['once']]}
                        autofocus={props.autofocus}
                        readonly={isReadonly.value}
                        disabled={isDisabled.value}
                        placeholder={props.placeholder}
                        rows={props.rows}
                        name={props.name}
                        onFocus={onFocus}
                        onBlur={blur}
                        {...slotProps}
                        {...inputAttrs}
                      />

                      { props.autoGrow && (
                        <textarea
                          class={[
                            fieldClass,
                            'v-textarea__sizer',
                          ]}
                          id={`${slotProps.id}-sizer`}
                          v-model={model.value}
                          ref={sizerRef}
                          readonly
                          aria-hidden="true"
                        />
                      )}

                      { props.suffix && (
                        <span class="v-text-field__suffix">
                          { props.suffix }
                        </span>
                      )}
                    </>
                  ),
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

    return forwardRefs({}, vInputRef, vFieldRef, textareaRef)
  },
})

export type CTextarea = InstanceType<typeof CTextarea>
