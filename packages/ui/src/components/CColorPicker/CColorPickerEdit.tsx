import './CColorPickerEdit.sass'
import { computed } from 'vue'
import type { PropType } from 'vue'
import { modes, nullColor } from './util'
import { CBtn } from '@/components/CBtn'
import { makeComponentProps } from '@/composables/component'
import { defineComponent, propsFactory, useRender } from '@/util'
import type { HSV } from '@/util/colorUtils'

function CColorPickerInput({ label, ...rest }: any) {
  return (
    <div
      class="v-color-picker-edit__input"
    >
      <input {...rest} />
      <span>{ label }</span>
    </div>
  )
}

export const makeCColorPickerEditProps = propsFactory({
  color: Object as PropType<HSV | null>,
  disabled: Boolean,
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

  ...makeComponentProps(),
}, 'CColorPickerEdit')

export const CColorPickerEdit = defineComponent({
  name: 'CColorPickerEdit',

  props: makeCColorPickerEditProps(),

  emits: {
    'update:color': (_color: HSV) => true,
    'update:mode': (_mode: keyof typeof modes) => true,
  },

  setup(props, { emit }) {
    const enabledModes = computed(() => {
      return props.modes.map(key => ({ ...modes[key], name: key }))
    })

    const inputs = computed(() => {
      const mode = enabledModes.value.find(m => m.name === props.mode)

      if (!mode)
        return []

      const color = props.color ? mode.to(props.color) : null

      return mode.inputs?.map(({ getValue, getColor, ...inputProps }) => {
        return {
          ...mode.inputProps,
          ...inputProps,
          disabled: props.disabled,
          value: color && getValue(color),
          onChange: (e: InputEvent) => {
            const target = e.target as HTMLInputElement | null

            if (!target)
              return

            emit('update:color', mode.from(getColor(color ?? mode.to(nullColor), target.value)))
          },
        }
      })
    })

    useRender(() => (
      <div
        class={[
          'v-color-picker-edit',
          props.class,
        ]}
        style={props.style}
      >
        { inputs.value?.map(props => (
          <CColorPickerInput {...props} />
        ))}
        { enabledModes.value.length > 1 && (
          <CBtn
            icon="$unfold"
            size="x-small"
            variant="plain"
            onClick={() => {
              const mi = enabledModes.value.findIndex(m => m.name === props.mode)

              emit('update:mode', enabledModes.value[(mi + 1) % enabledModes.value.length].name)
            }}
          />
        )}
      </div>
    ))

    return {}
  },
})

export type CColorPickerEdit = InstanceType<typeof CColorPickerEdit>
