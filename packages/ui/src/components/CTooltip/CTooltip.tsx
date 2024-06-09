import './CTooltip.sass'
import { computed, mergeProps, ref } from 'vue'
import { COverlay } from '@/components/COverlay'
import { makeCOverlayProps } from '@/components/COverlay/COverlay'
import { forwardRefs } from '@/composables/forwardRefs'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useScopeId } from '@/composables/scopeId'
import { genericComponent, getUid, omit, propsFactory, useRender } from '@/util'
import type { StrategyProps } from '@/components/COverlay/locationStrategies'
import type { OverlaySlots } from '@/components/COverlay/COverlay'

export const makeCTooltipProps = propsFactory({
  id: String,
  text: String,

  ...omit(makeCOverlayProps({
    closeOnBack: false,
    location: 'end' as const,
    locationStrategy: 'connected' as const,
    eager: true,
    minWidth: 0,
    offset: 10,
    openOnClick: false,
    openOnHover: true,
    origin: 'auto' as const,
    scrim: false,
    scrollStrategy: 'reposition' as const,
    transition: false,
  }), [
    'absolute',
    'persistent',
  ]),
}, 'CTooltip')

export const CTooltip = genericComponent<OverlaySlots>()({
  name: 'CTooltip',

  props: makeCTooltipProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const isActive = useProxiedModel(props, 'modelValue')
    const { scopeId } = useScopeId()

    const uid = getUid()
    const id = computed(() => props.id || `v-tooltip-${uid}`)

    const overlay = ref<COverlay>()

    const location = computed(() => {
      return props.location.split(' ').length > 1
        ? props.location
        : `${props.location} center` as StrategyProps['location']
    })

    const origin = computed(() => {
      return (
        props.origin === 'auto'
        || props.origin === 'overlap'
        || props.origin.split(' ').length > 1
        || props.location.split(' ').length > 1
      )
        ? props.origin
        : `${props.origin} center` as StrategyProps['origin']
    })

    const transition = computed(() => {
      if (props.transition)
        return props.transition
      return isActive.value ? 'scale-transition' : 'fade-transition'
    })

    const activatorProps = computed(() =>
      mergeProps({
        'aria-describedby': id.value,
      }, props.activatorProps),
    )

    useRender(() => {
      const overlayProps = COverlay.filterProps(props)

      return (
        <COverlay
          ref={overlay}
          class={[
            'v-tooltip',
            props.class,
          ]}
          style={props.style}
          id={id.value}
          {...overlayProps}
          v-model={isActive.value}
          transition={transition.value}
          absolute
          location={location.value}
          origin={origin.value}
          persistent
          role="tooltip"
          activatorProps={activatorProps.value}
          _disableGlobalStack
          {...scopeId}
        >
          {{
            activator: slots.activator,
            default: (...args) => slots.default?.(...args) ?? props.text,
          }}
        </COverlay>
      )
    })

    return forwardRefs({}, overlay)
  },
})

export type CTooltip = InstanceType<typeof CTooltip>
