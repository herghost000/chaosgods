import './CColorPicker.sass'
import { computed, onMounted, ref, watch } from 'vue'
import type { DeepReadonly, PropType } from 'vue'
import { CColorPickerCanvas } from './CColorPickerCanvas'
import { CColorPickerEdit } from './CColorPickerEdit'
import { CColorPickerPreview } from './CColorPickerPreview'
import { CColorPickerSwatches } from './CColorPickerSwatches'
import { extractColor, modes, nullColor } from './util'
import { CSheet, makeCSheetProps } from '@/components/CSheet/CSheet'
import { provideDefaults } from '@/composables/defaults'
import { useRtl } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { HSVtoCSS, RGBtoHSV, consoleWarn, defineComponent, omit, parseColor, propsFactory, useRender } from '@/util'
import type { Color, HSV } from '@/util'

export const makeCColorPickerProps = propsFactory({
  canvasHeight: {
    type: [String, Number],
    default: 150,
  },
  disabled: Boolean,
  dotSize: {
    type: [Number, String],
    default: 10,
  },
  hideCanvas: Boolean,
  hideSliders: Boolean,
  hideInputs: Boolean,
  mode: {
    type: String as PropType<keyof typeof modes>,
    default: 'rgba',
    validator: (v: string) => Object.keys(modes).includes(v),
  },
  modes: {
    type: Array as PropType<readonly (keyof typeof modes)[]>,
    default: () => Object.keys(modes),
    validator: (v: any) => Array.isArray(v) && v.every(m => Object.keys(modes).includes(m)),
  },
  showSwatches: Boolean,
  swatches: Array as PropType<DeepReadonly<Color[][]>>,
  swatchesMaxHeight: {
    type: [Number, String],
    default: 150,
  },
  modelValue: {
    type: [Object, String] as PropType<Record<string, unknown> | string | undefined | null>,
  },

  ...omit(makeCSheetProps({ width: 300 }), [
    'height',
    'location',
    'minHeight',
    'maxHeight',
    'minWidth',
    'maxWidth',
  ]),
}, 'CColorPicker')

export const CColorPicker = defineComponent({
  name: 'CColorPicker',

  props: makeCColorPickerProps(),

  emits: {
    'update:modelValue': (_color: any) => true,
    'update:mode': (_mode: keyof typeof modes) => true,
  },

  setup(props) {
    const mode = useProxiedModel(props, 'mode')
    const hue = ref<number | null>(null)
    const model = useProxiedModel(
      props,
      'modelValue',
      undefined,
      (v) => {
        if (v == null || v === '')
          return null

        let c: HSV
        try {
          c = RGBtoHSV(parseColor(v as any))
        }
        catch (err) {
          consoleWarn(err as any)
          return null
        }

        return c
      },
      (v) => {
        if (!v)
          return null

        return extractColor(v, props.modelValue)
      },
    )
    const currentColor = computed(() => {
      return model.value
        ? { ...model.value, h: hue.value ?? model.value.h }
        : null
    })
    const { rtlClasses } = useRtl()

    let externalChange = true
    watch(model, (v) => {
      if (!externalChange) {
        // prevent hue shift from rgb conversion inaccuracy
        externalChange = true
        return
      }
      if (!v)
        return
      hue.value = v.h
    }, { immediate: true })

    const updateColor = (hsva: HSV) => {
      externalChange = false
      hue.value = hsva.h
      model.value = hsva
    }

    onMounted(() => {
      if (!props.modes.includes(mode.value))
        mode.value = props.modes[0]
    })

    provideDefaults({
      CSlider: {
        color: undefined,
        trackColor: undefined,
        trackFillColor: undefined,
      },
    })

    useRender(() => {
      const sheetProps = CSheet.filterProps(props)

      return (
        <CSheet
          rounded={props.rounded}
          elevation={props.elevation}
          theme={props.theme}
          class={[
            'v-color-picker',
            rtlClasses.value,
            props.class,
          ]}
          style={[
            {
              '--v-color-picker-color-hsv': HSVtoCSS({ ...(currentColor.value ?? nullColor), a: 1 }),
            },
            props.style,
          ]}
          {...sheetProps}
          maxWidth={props.width}
        >
          { !props.hideCanvas && (
            <CColorPickerCanvas
              key="canvas"
              color={currentColor.value}
              onUpdate:color={updateColor}
              disabled={props.disabled}
              dotSize={props.dotSize}
              width={props.width}
              height={props.canvasHeight}
            />
          )}

          { (!props.hideSliders || !props.hideInputs) && (
            <div key="controls" class="v-color-picker__controls">
              { !props.hideSliders && (
                <CColorPickerPreview
                  key="preview"
                  color={currentColor.value}
                  onUpdate:color={updateColor}
                  hideAlpha={!mode.value.endsWith('a')}
                  disabled={props.disabled}
                />
              )}

              { !props.hideInputs && (
                <CColorPickerEdit
                  key="edit"
                  modes={props.modes}
                  mode={mode.value}
                  onUpdate:mode={m => mode.value = m}
                  color={currentColor.value}
                  onUpdate:color={updateColor}
                  disabled={props.disabled}
                />
              )}
            </div>
          )}

          { props.showSwatches && (
            <CColorPickerSwatches
              key="swatches"
              color={currentColor.value}
              onUpdate:color={updateColor}
              maxHeight={props.swatchesMaxHeight}
              swatches={props.swatches}
              disabled={props.disabled}
            />
          )}
        </CSheet>
      )
    })

    return {}
  },
})

export type CColorPicker = InstanceType<typeof CColorPicker>
