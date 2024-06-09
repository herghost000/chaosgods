import './CFab.sass'
import { computed, ref, shallowRef, toRef, watchEffect } from 'vue'
import type { ComputedRef, PropType } from 'vue'
import { CBtn, makeCBtnProps } from '@/components/CBtn/CBtn'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useResizeObserver } from '@/composables/resizeObserver'
import { useToggleScope } from '@/composables/toggleScope'
import { MaybeTransition, makeTransitionProps } from '@/composables/transition'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { Position } from '@/composables/layout'

const locations = ['start', 'end', 'left', 'right', 'top', 'bottom'] as const

export const makeCFabProps = propsFactory({
  app: Boolean,
  appear: Boolean,
  extended: Boolean,
  layout: Boolean,
  location: {
    type: String as PropType<typeof locations[number]>,
    default: 'bottom end',
  },
  offset: Boolean,
  modelValue: {
    type: Boolean,
    default: true,
  },

  ...omit(makeCBtnProps({ active: true }), ['location']),
  ...makeLayoutItemProps(),
  ...makeTransitionProps({ transition: 'fab-transition' }),
}, 'CFab')

export const CFab = genericComponent()({
  name: 'CFab',

  props: makeCFabProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const height = shallowRef(56)
    const layoutItemStyles = ref()

    const { resizeRef } = useResizeObserver((entries) => {
      if (!entries.length)
        return
      height.value = entries[0].target.clientHeight
    })

    const hasPosition = computed(() => props.app || props.absolute)

    const position = computed(() => {
      if (!hasPosition.value)
        return false

      return props.location.split(' ').shift()
    }) as ComputedRef<Position>

    const orientation = computed(() => {
      if (!hasPosition.value)
        return false

      return props.location.split(' ')[1] ?? 'end'
    })

    useToggleScope(() => props.app, () => {
      const layout = useLayoutItem({
        id: props.name,
        order: computed(() => Number.parseInt(`${props.order}`, 10)),
        position,
        layoutSize: computed(() => props.layout ? height.value + 24 : 0),
        elementSize: computed(() => height.value + 24),
        active: computed(() => props.app && model.value),
        absolute: toRef(props, 'absolute'),
      })

      watchEffect(() => {
        layoutItemStyles.value = layout.layoutItemStyles.value
      })
    })

    const vFabRef = ref()

    useRender(() => {
      const btnProps = CBtn.filterProps(props)

      return (
        <div
          ref={vFabRef}
          class={[
            'v-fab',
            {
              'v-fab--absolute': props.absolute,
              'v-fab--app': !!props.app,
              'v-fab--extended': props.extended,
              'v-fab--offset': props.offset,
              [`v-fab--${position.value}`]: hasPosition.value,
              [`v-fab--${orientation.value}`]: hasPosition.value,
            },
            props.class,
          ]}
          style={[
            props.app
              ? {
                  ...layoutItemStyles.value,
                }
              : {
                  height: 'inherit',
                  width: undefined,
                },
            props.style,
          ]}
        >
          <div class="v-fab__container">
            <MaybeTransition
              appear={props.appear}
              transition={props.transition}
            >
              <CBtn
                v-show={props.active}
                ref={resizeRef}
                {...btnProps}
                active={undefined}
                location={undefined}
                v-slots={slots}
              />
            </MaybeTransition>
          </div>
        </div>
      )
    })

    return {}
  },
})

export type CFab = InstanceType<typeof CFab>
