import './CDatePickerHeader.sass'
import { CBtn } from '@/components/CBtn'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { useBackgroundColor } from '@/composables/color'
import { MaybeTransition } from '@/composables/transition'
import { EventProp, genericComponent, propsFactory, useRender } from '@/util'

export type CDatePickerHeaderSlots = {
  prepend: never
  default: never
  append: never
}

export const makeCDatePickerHeaderProps = propsFactory({
  appendIcon: String,
  color: String,
  header: String,
  transition: String,
  onClick: EventProp<[MouseEvent]>(),
}, 'CDatePickerHeader')

export const CDatePickerHeader = genericComponent<CDatePickerHeaderSlots>()({
  name: 'CDatePickerHeader',

  props: makeCDatePickerHeaderProps(),

  emits: {
    'click': () => true,
    'click:append': () => true,
  },

  setup(props, { emit, slots }) {
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'color')

    function onClick() {
      emit('click')
    }

    function onClickAppend() {
      emit('click:append')
    }

    useRender(() => {
      const hasContent = !!(slots.default || props.header)
      const hasAppend = !!(slots.append || props.appendIcon)

      return (
        <div
          class={[
            'v-date-picker-header',
            {
              'v-date-picker-header--clickable': !!props.onClick,
            },
            backgroundColorClasses.value,
          ]}
          style={backgroundColorStyles.value}
          onClick={onClick}
        >
          { slots.prepend && (
            <div key="prepend" class="v-date-picker-header__prepend">
              { slots.prepend() }
            </div>
          )}

          { hasContent && (
            <MaybeTransition key="content" name={props.transition}>
              <div key={props.header} class="v-date-picker-header__content">
                { slots.default?.() ?? props.header }
              </div>
            </MaybeTransition>
          )}

          { hasAppend && (
            <div class="v-date-picker-header__append">
              { !slots.append
                ? (
                  <CBtn
                    key="append-btn"
                    icon={props.appendIcon}
                    variant="text"
                    onClick={onClickAppend}
                  />
                  )
                : (
                  <CDefaultsProvider
                    key="append-defaults"
                    disabled={!props.appendIcon}
                    defaults={{
                      CBtn: {
                        icon: props.appendIcon,
                        variant: 'text',
                      },
                    }}
                  >
                    { slots.append?.() }
                  </CDefaultsProvider>
                  )}
            </div>
          )}
        </div>
      )
    })

    return {}
  },
})

export type CDatePickerHeader = InstanceType<typeof CDatePickerHeader>
