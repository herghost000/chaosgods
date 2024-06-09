import './CPicker.sass'
import { toRef } from 'vue'
import { CPickerTitle } from './CPickerTitle'
import { CDefaultsProvider } from '@/components/CDefaultsProvider/CDefaultsProvider'
import { CSheet, makeCSheetProps } from '@/components/CSheet/CSheet'
import { useBackgroundColor } from '@/composables/color'
import { genericComponent, propsFactory, useRender } from '@/util'

export type CPickerSlots = {
  header: never
  default: never
  actions: never
  title: never
}

export const makeCPickerProps = propsFactory({
  bgColor: String,
  landscape: Boolean,
  title: String,
  hideHeader: Boolean,

  ...makeCSheetProps(),
}, 'CPicker')

export const CPicker = genericComponent<CPickerSlots>()({
  name: 'CPicker',

  props: makeCPickerProps(),

  setup(props, { slots }) {
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'color'))
    useRender(() => {
      const sheetProps = CSheet.filterProps(props)
      const hasTitle = !!(props.title || slots.title)

      return (
        <CSheet
          {...sheetProps}
          color={props.bgColor}
          class={[
            'v-picker',
            {
              'v-picker--landscape': props.landscape,
              'v-picker--with-actions': !!slots.actions,
            },
            props.class,
          ]}
          style={props.style}
        >
          { !props.hideHeader && (
            <div
              key="header"
              class={[
                backgroundColorClasses.value,
              ]}
              style={[
                backgroundColorStyles.value,
              ]}
            >
              { hasTitle && (
                <CPickerTitle key="picker-title">
                  { slots.title?.() ?? props.title }
                </CPickerTitle>
              )}

              { slots.header && (
                <div class="v-picker__header">
                  { slots.header() }
                </div>
              )}
            </div>
          )}

          <div class="v-picker__body">
            { slots.default?.() }
          </div>

          { slots.actions && (
            <CDefaultsProvider
              defaults={{
                CBtn: {
                  slim: true,
                  variant: 'text',
                },
              }}
            >
              <div class="v-picker__actions">
                { slots.actions() }
              </div>
            </CDefaultsProvider>
          )}
        </CSheet>
      )
    })

    return {}
  },
})

export type CPicker = InstanceType<typeof CPicker>
