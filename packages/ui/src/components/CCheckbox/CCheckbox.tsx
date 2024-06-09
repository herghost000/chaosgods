import './CCheckbox.sass'
import { computed } from 'vue'
import type { CSelectionControlSlots } from '../CSelectionControl/CSelectionControl'
import { CCheckboxBtn, makeCCheckboxBtnProps } from './CCheckboxBtn'
import { CInput, makeCInputProps } from '@/components/CInput/CInput'
import { useFocus } from '@/composables/focus'
import { useProxiedModel } from '@/composables/proxiedModel'
import {
  filterInputAttrs,
  genericComponent,
  getUid,
  omit,
  propsFactory,
  useRender,
} from '@/util'
import type { CInputSlots } from '@/components/CInput/CInput'
import type { GenericProps } from '@/util'

export type CCheckboxSlots = Omit<CInputSlots, 'default'> &
  CSelectionControlSlots

export const makeCCheckboxProps = propsFactory(
  {
    ...makeCInputProps(),
    ...omit(makeCCheckboxBtnProps(), ['inline']),
  },
  'CCheckbox',
)

export const CCheckbox = genericComponent<
  new<T>(
    props: {
      'modelValue'?: T | null
      'onUpdate:modelValue'?: (value: T | null) => void
    },
    slots: CCheckboxSlots,
  ) => GenericProps<typeof props, typeof slots>
>()({
  name: 'CCheckbox',

  inheritAttrs: false,

  props: makeCCheckboxProps(),

  emits: {
    'update:modelValue': (_value: any) => true,
    'update:focused': (_focused: boolean) => true,
  },

  setup(props, { attrs, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const { isFocused, focus, blur } = useFocus(props)

    const uid = getUid()
    const id = computed(() => props.id || `checkbox-${uid}`)

    useRender(() => {
      const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)
      const inputProps = CInput.filterProps(props)
      const checkboxProps = CCheckboxBtn.filterProps(props)

      return (
        <CInput
          class={['v-checkbox', props.class]}
          {...rootAttrs}
          {...inputProps}
          v-model={model.value}
          id={id.value}
          focused={isFocused.value}
          style={props.style}
        >
          {{
            ...slots,
            default: ({ id, messagesId, isDisabled, isReadonly, isValid }) => (
              <CCheckboxBtn
                {...checkboxProps}
                id={id.value}
                aria-describedby={messagesId.value}
                disabled={isDisabled.value}
                readonly={isReadonly.value}
                {...controlAttrs}
                error={isValid.value === false}
                v-model={model.value}
                onFocus={focus}
                onBlur={blur}
                v-slots={slots}
              />
            ),
          }}
        </CInput>
      )
    })

    return {}
  },
})

export type CCheckbox = InstanceType<typeof CCheckbox>
