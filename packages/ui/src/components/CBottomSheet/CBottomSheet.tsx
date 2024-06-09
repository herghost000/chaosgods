// Styles
import './CBottomSheet.sass'

// Components
import { CDialog, makeCDialogProps } from '@/components/CDialog/CDialog'

// Composables
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

// Types
import type { OverlaySlots } from '@/components/COverlay/COverlay'

export const makeCBottomSheetProps = propsFactory({
  inset: Boolean,

  ...makeCDialogProps({
    transition: 'bottom-sheet-transition',
  }),
}, 'CBottomSheet')

export const CBottomSheet = genericComponent<OverlaySlots>()({
  name: 'CBottomSheet',

  props: makeCBottomSheetProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const isActive = useProxiedModel(props, 'modelValue')

    useRender(() => {
      const dialogProps = CDialog.filterProps(props)

      return (
        <CDialog
          {...dialogProps}
          contentClass={[
            'v-bottom-sheet__content',
            props.contentClass,
          ]}
          v-model={isActive.value}
          class={[
            'v-bottom-sheet',
            {
              'v-bottom-sheet--inset': props.inset,
            },
            props.class,
          ]}
          style={props.style}
          v-slots={slots}
        />
      )
    })

    return {}
  },
})

export type CBottomSheet = InstanceType<typeof CBottomSheet>
