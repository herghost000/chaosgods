import './CField.sass'
import { computed, ref, toRef, watch } from 'vue'
import type { PropType, Ref } from 'vue'
import { CFieldLabel } from './CFieldLabel'
import { CExpandXTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { useInputIcon } from '@/components/CInput/InputIcon'
import { useBackgroundColor, useTextColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { makeFocusProps, useFocus } from '@/composables/focus'
import { IconValue } from '@/composables/icons'
import { LoaderSlot, makeLoaderProps, useLoader } from '@/composables/loader'
import { useRtl } from '@/composables/locale'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import {
  EventProp,
  animate,
  convertToUnit,
  genericComponent,
  getUid,
  isOn,
  nullifyTransforms,
  pick,
  propsFactory,
  standardEasing,
  useRender,
} from '@/util'
import type { LoaderSlotProps } from '@/composables/loader'
import type { GenericProps } from '@/util'

const allowedVariants = ['underlined', 'outlined', 'filled', 'solo', 'solo-inverted', 'solo-filled', 'plain'] as const
type Variant = typeof allowedVariants[number]

export interface DefaultInputSlot {
  isActive: Ref<boolean>
  isFocused: Ref<boolean>
  controlRef: Ref<HTMLElement | undefined>
  focus: () => void
  blur: () => void
}

export interface CFieldSlot extends DefaultInputSlot {
  props: Record<string, unknown>
}

export const makeCFieldProps = propsFactory({
  'appendInnerIcon': IconValue,
  'bgColor': String,
  'clearable': Boolean,
  'clearIcon': {
    type: IconValue,
    default: '$clear',
  },
  'active': Boolean,
  'centerAffix': {
    type: Boolean,
    default: undefined,
  },
  'color': String,
  'baseColor': String,
  'dirty': Boolean,
  'disabled': {
    type: Boolean,
    default: null,
  },
  'error': Boolean,
  'flat': Boolean,
  'label': String,
  'persistentClear': Boolean,
  'prependInnerIcon': IconValue,
  'reverse': Boolean,
  'singleLine': Boolean,
  'variant': {
    type: String as PropType<Variant>,
    default: 'filled',
    validator: (v: any) => allowedVariants.includes(v),
  },

  'onClick:clear': EventProp<[MouseEvent]>(),
  'onClick:appendInner': EventProp<[MouseEvent]>(),
  'onClick:prependInner': EventProp<[MouseEvent]>(),

  ...makeComponentProps(),
  ...makeLoaderProps(),
  ...makeRoundedProps(),
  ...makeThemeProps(),
}, 'CField')

export type CFieldSlots = {
  'clear': DefaultInputSlot & { props: Record<string, any> }
  'prepend-inner': DefaultInputSlot
  'append-inner': DefaultInputSlot
  'label': DefaultInputSlot & { label: string | undefined, props: Record<string, any> }
  'loader': LoaderSlotProps
  'default': CFieldSlot
}

export const CField = genericComponent<new<T>(
  props: {
    'modelValue'?: T
    'onUpdate:modelValue'?: (value: T) => void
  },
  slots: CFieldSlots
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CField',

  inheritAttrs: false,

  props: {
    id: String,

    ...makeFocusProps(),
    ...makeCFieldProps(),
  },

  emits: {
    'update:focused': (_focused: boolean) => true,
    'update:modelValue': (_value: any) => true,
  },

  setup(props, { attrs, slots }) {
    const { themeClasses } = provideTheme(props)
    const { loaderClasses } = useLoader(props)
    const { focusClasses, isFocused, focus, blur } = useFocus(props)
    const { InputIcon } = useInputIcon(props)
    const { roundedClasses } = useRounded(props)
    const { rtlClasses } = useRtl()

    const isActive = computed(() => props.dirty || props.active)
    const hasLabel = computed(() => !props.singleLine && !!(props.label || slots.label))

    const uid = getUid()
    const id = computed(() => props.id || `input-${uid}`)
    const messagesId = computed(() => `${id.value}-messages`)

    const labelRef = ref<CFieldLabel>()
    const floatingLabelRef = ref<CFieldLabel>()
    const controlRef = ref<HTMLElement>()
    const isPlainOrUnderlined = computed(() => ['plain', 'underlined'].includes(props.variant))

    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { textColorClasses, textColorStyles } = useTextColor(computed(() => {
      return props.error || props.disabled
        ? undefined
        : isActive.value && isFocused.value
          ? props.color
          : props.baseColor
    }))

    watch(isActive, (val) => {
      if (hasLabel.value) {
        const el: HTMLElement = labelRef.value!.$el
        const targetEl: HTMLElement = floatingLabelRef.value!.$el

        requestAnimationFrame(() => {
          const rect = nullifyTransforms(el)
          const targetRect = targetEl.getBoundingClientRect()

          const x = targetRect.x - rect.x
          const y = targetRect.y - rect.y - (rect.height / 2 - targetRect.height / 2)

          const targetWidth = targetRect.width / 0.75
          const width = Math.abs(targetWidth - rect.width) > 1
            ? { maxWidth: convertToUnit(targetWidth) }
            : undefined

          const style = getComputedStyle(el)
          const targetStyle = getComputedStyle(targetEl)
          const duration = Number.parseFloat(style.transitionDuration) * 1000 || 150
          const scale = Number.parseFloat(targetStyle.getPropertyValue('--v-field-label-scale'))
          const color = targetStyle.getPropertyValue('color')

          el.style.visibility = 'visible'
          targetEl.style.visibility = 'hidden'

          animate(el, {
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            color,
            ...width,
          }, {
            duration,
            easing: standardEasing,
            direction: val ? 'normal' : 'reverse',
          }).finished.then(() => {
            el.style.removeProperty('visibility')
            targetEl.style.removeProperty('visibility')
          })
        })
      }
    }, { flush: 'post' })

    const slotProps = computed<DefaultInputSlot>(() => ({
      isActive,
      isFocused,
      controlRef,
      blur,
      focus,
    }))

    function onClick(e: MouseEvent) {
      if (e.target !== document.activeElement)
        e.preventDefault()
    }

    function onKeydownClear(e: KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ')
        return

      e.preventDefault()
      e.stopPropagation()

      props['onClick:clear']?.(new MouseEvent('click'))
    }

    useRender(() => {
      const isOutlined = props.variant === 'outlined'
      const hasPrepend = !!(slots['prepend-inner'] || props.prependInnerIcon)
      const hasClear = !!(props.clearable || slots.clear)
      const hasAppend = !!(slots['append-inner'] || props.appendInnerIcon || hasClear)
      const label = () => (
        slots.label
          ? slots.label({
            ...slotProps.value,
            label: props.label,
            props: { for: id.value },
          })
          : props.label
      )

      return (
        <div
          class={[
            'v-field',
            {
              'v-field--active': isActive.value,
              'v-field--appended': hasAppend,
              'v-field--center-affix': props.centerAffix ?? !isPlainOrUnderlined.value,
              'v-field--disabled': props.disabled,
              'v-field--dirty': props.dirty,
              'v-field--error': props.error,
              'v-field--flat': props.flat,
              'v-field--has-background': !!props.bgColor,
              'v-field--persistent-clear': props.persistentClear,
              'v-field--prepended': hasPrepend,
              'v-field--reverse': props.reverse,
              'v-field--single-line': props.singleLine,
              'v-field--no-label': !label(),
              [`v-field--variant-${props.variant}`]: true,
            },
            themeClasses.value,
            backgroundColorClasses.value,
            focusClasses.value,
            loaderClasses.value,
            roundedClasses.value,
            rtlClasses.value,
            props.class,
          ]}
          style={[
            backgroundColorStyles.value,
            props.style,
          ]}
          onClick={onClick}
          {...attrs}
        >
          <div class="v-field__overlay" />

          <LoaderSlot
            name="v-field"
            active={!!props.loading}
            color={props.error ? 'error' : (typeof props.loading === 'string' ? props.loading : props.color)}
            v-slots={{ default: slots.loader }}
          />

          { hasPrepend && (
            <div key="prepend" class="v-field__prepend-inner">
              { props.prependInnerIcon && (
                <InputIcon key="prepend-icon" name="prependInner" />
              )}

              { slots['prepend-inner']?.(slotProps.value) }
            </div>
          )}

          <div class="v-field__field" data-no-activator="">
            {['filled', 'solo', 'solo-inverted', 'solo-filled'].includes(props.variant) && hasLabel.value && (
              <CFieldLabel
                key="floating-label"
                ref={floatingLabelRef}
                class={[textColorClasses.value]}
                floating
                for={id.value}
                style={textColorStyles.value}
              >
                { label() }
              </CFieldLabel>
            )}

            <CFieldLabel ref={labelRef} for={id.value}>
              { label() }
            </CFieldLabel>

            { slots.default?.({
              ...slotProps.value,
              props: {
                'id': id.value,
                'class': 'v-field__input',
                'aria-describedby': messagesId.value,
              },
              focus,
              blur,
            } as CFieldSlot)}
          </div>

          { hasClear && (
            <CExpandXTransition key="clear">
              <div
                class="v-field__clearable"
                v-show={props.dirty}
                onMousedown={(e: MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <CDefaultsProvider
                  defaults={{
                    CIcon: {
                      icon: props.clearIcon,
                    },
                  }}
                >
                  { slots.clear
                    ? slots.clear({
                      ...slotProps.value,
                      props: {
                        onKeydown: onKeydownClear,
                        onFocus: focus,
                        onBlur: blur,
                        onClick: props['onClick:clear'],
                      },
                    })
                    : (
                      <InputIcon
                        name="clear"
                        onKeydown={onKeydownClear}
                        onFocus={focus}
                        onBlur={blur}
                      />
                      )}
                </CDefaultsProvider>
              </div>
            </CExpandXTransition>
          )}

          { hasAppend && (
            <div key="append" class="v-field__append-inner">
              { slots['append-inner']?.(slotProps.value) }

              { props.appendInnerIcon && (
                <InputIcon key="append-icon" name="appendInner" />
              )}
            </div>
          )}

          <div
            class={[
              'v-field__outline',
              textColorClasses.value,
            ]}
            style={textColorStyles.value}
          >
            { isOutlined && (
              <>
                <div class="v-field__outline__start" />

                { hasLabel.value && (
                  <div class="v-field__outline__notch">
                    <CFieldLabel ref={floatingLabelRef} floating for={id.value}>
                      { label() }
                    </CFieldLabel>
                  </div>
                )}

                <div class="v-field__outline__end" />
              </>
            )}

            { isPlainOrUnderlined.value && hasLabel.value && (
              <CFieldLabel ref={floatingLabelRef} floating for={id.value}>
                { label() }
              </CFieldLabel>
            )}
          </div>
        </div>
      )
    })

    return {
      controlRef,
    }
  },
})

export type CField = InstanceType<typeof CField>

// TODO: this is kinda slow, might be better to implicitly inherit props instead
export function filterFieldProps(attrs: Record<string, unknown>) {
  const keys = Object.keys(CField.props).filter(k => !isOn(k) && k !== 'class' && k !== 'style')
  return pick(attrs, keys)
}
