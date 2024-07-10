import { computed, shallowRef } from 'vue'
import { CConfirmEdit, makeCConfirmEditProps } from '@/components/CConfirmEdit/CConfirmEdit'
import { CDatePicker, makeCDatePickerProps } from '@/components/CDatePicker/CDatePicker'
import { CMenu } from '@/components/CMenu/CMenu'
import { CTextField, makeCTextFieldProps } from '@/components/CTextField/CTextField'
import { useDate } from '@/composables/date'
import { makeFocusProps, useFocus } from '@/composables/focus'
import { useLocale } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender, wrapInArray } from '@/util'

export type CDateInputSlots = {
  default: never
}

export const makeCDateInputProps = propsFactory({
  hideActions: Boolean,

  ...makeFocusProps(),
  ...makeCConfirmEditProps(),
  ...makeCTextFieldProps({
    placeholder: 'mm/dd/yyyy',
    prependIcon: '$calendar',
  }),
  ...omit(makeCDatePickerProps({
    weeksInMonth: 'dynamic' as const,
    hideHeader: true,
  }), ['active']),
}, 'CDateInput')

export const CDateInput = genericComponent<CDateInputSlots>()({
  name: 'CDateInput',

  props: makeCDateInputProps(),

  emits: {
    'update:modelValue': (_val: string) => true,
  },

  setup(props, { slots }) {
    const { t } = useLocale()
    const adapter = useDate()
    const { isFocused, focus, blur } = useFocus(props)
    const model = useProxiedModel(props, 'modelValue', props.multiple ? [] : null)
    const menu = shallowRef(false)

    const display = computed(() => {
      const value = wrapInArray(model.value)

      if (!value.length)
        return null

      if (props.multiple === true)
        return t('$chaos.datePicker.itemsSelected', value.length)

      if (props.multiple === 'range') {
        const start = value[0]
        const end = value[value.length - 1]

        return adapter.isValid(start) && adapter.isValid(end)
          ? `${adapter.format(start, 'keyboardDate')} - ${adapter.format(end, 'keyboardDate')}`
          : ''
      }

      return adapter.isValid(model.value) ? adapter.format(model.value, 'keyboardDate') : ''
    })

    function onKeydown(e: KeyboardEvent) {
      if (e.key !== 'Enter')
        return

      if (!menu.value || !isFocused.value) {
        menu.value = true

        return
      }

      const target = e.target as HTMLInputElement

      model.value = adapter.date(target.value)
    }

    function onClick(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()

      menu.value = true
    }

    function onSave() {
      menu.value = false
    }

    useRender(() => {
      const confirmEditProps = CConfirmEdit.filterProps(props)
      const datePickerProps = CDatePicker.filterProps(omit(props, ['active']))
      const textFieldProps = CTextField.filterProps(props)

      return (
        <CTextField
          {...textFieldProps}
          modelValue={display.value}
          onKeydown={onKeydown}
          focused={menu.value || isFocused.value}
          onFocus={focus}
          onBlur={blur}
          onClick:control={onClick}
          onClick:prepend={onClick}
        >
          <CMenu
            v-model={menu.value}
            activator="parent"
            min-width="0"
            closeOnContentClick={false}
            openOnClick={false}
          >
            <CConfirmEdit
              {...confirmEditProps}
              v-model={model.value}
              onSave={onSave}
            >
              {{
                default: ({ actions, model: proxyModel }) => {
                  return (
                    <CDatePicker
                      {...datePickerProps}
                      modelValue={props.hideActions ? model.value : proxyModel.value}
                      onUpdate:modelValue={(val) => {
                        if (!props.hideActions) {
                          proxyModel.value = val
                        }
                        else {
                          model.value = val

                          if (!props.multiple)
                            menu.value = false
                        }
                      }}
                      onMousedown={(e: MouseEvent) => e.preventDefault()}
                    >
                      {{
                        actions: !props.hideActions ? () => actions : undefined,
                      }}
                    </CDatePicker>
                  )
                },
              }}
            </CConfirmEdit>
          </CMenu>

          { slots.default?.() }
        </CTextField>
      )
    })
  },
})

export type CDateInput = InstanceType<typeof CDateInput>
