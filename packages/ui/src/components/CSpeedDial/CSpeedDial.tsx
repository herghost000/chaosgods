import './CSpeedDial.sass'
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CMenu, makeCMenuProps } from '@/components/CMenu/CMenu'
import { makeComponentProps } from '@/composables/component'
import { useProxiedModel } from '@/composables/proxiedModel'
import { MaybeTransition } from '@/composables/transition'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { OverlaySlots } from '@/components/COverlay/COverlay'
import type { Anchor } from '@/util'

export const makeCSpeedDialProps = propsFactory({
  ...makeComponentProps(),
  ...makeCMenuProps({
    offset: 8,
    minWidth: 0,
    openDelay: 0,
    closeDelay: 100,
    location: 'top center' as const,
    transition: 'scale-transition',
  }),
}, 'CSpeedDial')

export const CSpeedDial = genericComponent<OverlaySlots>()({
  name: 'CSpeedDial',

  props: makeCSpeedDialProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const model = useProxiedModel(props, 'modelValue')

    const menuRef = ref<CMenu>()

    const location = computed(() => {
      const [y, x = 'center'] = props.location.split(' ')

      return `${y} ${x}`
    }) as ComputedRef<Anchor>

    const locationClasses = computed(() => ({
      [`v-speed-dial__content--${location.value.replace(' ', '-')}`]: true,
    }))

    useRender(() => {
      const menuProps = CMenu.filterProps(props)

      return (
        <CMenu
          {...menuProps}
          v-model={model.value}
          class={props.class}
          style={props.style}
          contentClass={[
            'v-speed-dial__content',
            locationClasses.value,
          ]}
          location={location.value}
          ref={menuRef}
          transition="fade-transition"
        >
          {{
            ...slots,
            default: slotProps => (
              <CDefaultsProvider
                defaults={{
                  CBtn: {
                    size: 'small',
                  },
                }}
              >
                <MaybeTransition
                  appear
                  group
                  transition={props.transition}
                >
                  { slots.default?.(slotProps) }
                </MaybeTransition>
              </CDefaultsProvider>
            ),
          }}
        </CMenu>
      )
    })

    return {}
  },
})

export type CSpeedDial = InstanceType<typeof CSpeedDial>
