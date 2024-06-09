import './CColorPickerPreview.sass'
import { onUnmounted } from 'vue'
import type { PropType } from 'vue'
import { nullColor } from './util'
import { CBtn } from '@/components/CBtn'
import { CSlider } from '@/components/CSlider'
import { makeComponentProps } from '@/composables/component'
import {
  HSVtoCSS,
  HexToHSV,
  SUPPORTS_EYE_DROPPER,
  defineComponent,
  propsFactory,
  useRender,
} from '@/util'
import type { HSV, Hex } from '@/util'

export const makeCColorPickerPreviewProps = propsFactory({
  color: {
    type: Object as PropType<HSV | null>,
  },
  disabled: Boolean,
  hideAlpha: Boolean,

  ...makeComponentProps(),
}, 'CColorPickerPreview')

export const CColorPickerPreview = defineComponent({
  name: 'CColorPickerPreview',

  props: makeCColorPickerPreviewProps(),

  emits: {
    'update:color': (_color: HSV) => true,
  },

  setup(props, { emit }) {
    const abortController = new AbortController()

    onUnmounted(() => abortController.abort())

    async function openEyeDropper() {
      if (!SUPPORTS_EYE_DROPPER)
        return

      const eyeDropper = new window.EyeDropper()
      try {
        const result = await eyeDropper.open({ signal: abortController.signal })
        const colorHexValue = HexToHSV(result.sRGBHex as Hex)
        emit('update:color', { ...(props.color ?? nullColor), ...colorHexValue })
      }
      catch (e) {}
    }

    useRender(() => (
      <div
        class={[
          'v-color-picker-preview',
          {
            'v-color-picker-preview--hide-alpha': props.hideAlpha,
          },
          props.class,
        ]}
        style={props.style}
      >
        { SUPPORTS_EYE_DROPPER && (
          <div class="v-color-picker-preview__eye-dropper" key="eyeDropper">
            <CBtn onClick={openEyeDropper} icon="$eyeDropper" variant="plain" density="comfortable" />
          </div>
        )}

        <div class="v-color-picker-preview__dot">
          <div style={{ background: HSVtoCSS(props.color ?? nullColor) }} />
        </div>

        <div class="v-color-picker-preview__sliders">
          <CSlider
            class="v-color-picker-preview__track v-color-picker-preview__hue"
            modelValue={props.color?.h}
            onUpdate:modelValue={h => emit('update:color', { ...(props.color ?? nullColor), h })}
            step={0}
            min={0}
            max={360}
            disabled={props.disabled}
            thumbSize={14}
            trackSize={8}
            trackFillColor="white"
            hideDetails
          />

          { !props.hideAlpha && (
            <CSlider
              class="v-color-picker-preview__track v-color-picker-preview__alpha"
              modelValue={props.color?.a ?? 1}
              onUpdate:modelValue={a => emit('update:color', { ...(props.color ?? nullColor), a })}
              step={1 / 256}
              min={0}
              max={1}
              disabled={props.disabled}
              thumbSize={14}
              trackSize={8}
              trackFillColor="white"
              hideDetails
            />
          )}
        </div>
      </div>
    ))

    return {}
  },
})

export type CColorPickerPreview = InstanceType<typeof CColorPickerPreview>
