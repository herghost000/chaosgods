import './CColorPickerSwatches.sass'
import type { DeepReadonly, PropType } from 'vue'
import { CIcon } from '@/components/CIcon'
import { makeComponentProps } from '@/composables/component'
import {
  RGBtoCSS,
  RGBtoHSV,
  convertToUnit,
  deepEqual,
  defineComponent,
  getContrast,
  parseColor,
  propsFactory,
  useRender,
} from '@/util'
import colors from '@/util/colors'
import type { Color, HSV } from '@/util'

export const makeCColorPickerSwatchesProps = propsFactory({
  swatches: {
    type: Array as PropType<DeepReadonly<Color[][]>>,
    default: () => parseDefaultColors(colors),
  },
  disabled: Boolean,
  color: Object as PropType<HSV | null>,
  maxHeight: [Number, String],

  ...makeComponentProps(),
}, 'CColorPickerSwatches')

function parseDefaultColors(colors: Record<string, Record<string, string>>) {
  return Object.keys(colors).map((key) => {
    const color = colors[key]
    return color.base
      ? [
          color.base,
          color.darken4,
          color.darken3,
          color.darken2,
          color.darken1,
          color.lighten1,
          color.lighten2,
          color.lighten3,
          color.lighten4,
          color.lighten5,
        ]
      : [
          color.black,
          color.white,
          color.transparent,
        ]
  })
}

export const CColorPickerSwatches = defineComponent({
  name: 'CColorPickerSwatches',

  props: makeCColorPickerSwatchesProps(),

  emits: {
    'update:color': (_color: HSV) => true,
  },

  setup(props, { emit }) {
    useRender(() => (
      <div
        class={[
          'v-color-picker-swatches',
          props.class,
        ]}
        style={[
          { maxHeight: convertToUnit(props.maxHeight) },
          props.style,
        ]}
      >
        <div>
          { props.swatches.map(swatch => (
            <div class="v-color-picker-swatches__swatch">
              { swatch.map((color) => {
                const rgba = parseColor(color)
                const hsva = RGBtoHSV(rgba)
                const background = RGBtoCSS(rgba)

                return (
                  <div
                    class="v-color-picker-swatches__color"
                    onClick={() => hsva && emit('update:color', hsva)}
                  >
                    <div style={{ background }}>
                      { props.color && deepEqual(props.color, hsva)
                        ? <CIcon size="x-small" icon="$success" color={getContrast(color, '#FFFFFF') > 2 ? 'white' : 'black'} />
                        : undefined}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    ))

    return {}
  },
})

export type CColorPickerSwatches = InstanceType<typeof CColorPickerSwatches>
