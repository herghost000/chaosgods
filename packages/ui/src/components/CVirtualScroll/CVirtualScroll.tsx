import './CVirtualScroll.sass'
import { onMounted, onScopeDispose, toRef } from 'vue'
import type { PropType, Ref } from 'vue'
import { CVirtualScrollItem } from './CVirtualScrollItem'
import { makeComponentProps } from '@/composables/component'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { useToggleScope } from '@/composables/toggleScope'
import { makeVirtualProps, useVirtual } from '@/composables/virtual'
import {
  convertToUnit,
  genericComponent,
  getCurrentInstance,
  getScrollParent,
  propsFactory,
  useRender,
} from '@/util'
import type { GenericProps } from '@/util'

export interface CVirtualScrollSlot<T> {
  item: T
  index: number
}

export const makeCVirtualScrollProps = propsFactory({
  items: {
    type: Array as PropType<readonly unknown[]>,
    default: () => ([]),
  },
  renderless: Boolean,

  ...makeVirtualProps(),
  ...makeComponentProps(),
  ...makeDimensionProps(),
}, 'CVirtualScroll')

export const CVirtualScroll = genericComponent<new<T, Renderless extends boolean = false>(
  props: {
    items?: readonly T[]
    renderless?: Renderless
  },
  slots: {
    default: CVirtualScrollSlot<T> & (Renderless extends true ? {
      itemRef: Ref<HTMLElement | undefined>
    } : {})
  }
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CVirtualScroll',

  props: makeCVirtualScrollProps(),

  setup(props, { slots }) {
    const vm = getCurrentInstance('CVirtualScroll')
    const { dimensionStyles } = useDimension(props)
    const {
      containerRef,
      markerRef,
      handleScroll,
      handleScrollend,
      handleItemResize,
      scrollToIndex,
      paddingTop,
      paddingBottom,
      computedItems,
    } = useVirtual(props, toRef(props, 'items'))

    useToggleScope(() => props.renderless, () => {
      function handleListeners(add = false) {
        const method = add ? 'addEventListener' : 'removeEventListener'

        if (containerRef.value === document.documentElement) {
          document[method]('scroll', handleScroll, { passive: true })
          document[method]('scrollend', handleScrollend)
        }
        else {
          containerRef.value?.[method]('scroll', handleScroll, { passive: true })
          containerRef.value?.[method]('scrollend', handleScrollend)
        }
      }

      onMounted(() => {
        containerRef.value = getScrollParent(vm.vnode.el as HTMLElement, true)
        handleListeners(true)
      })
      onScopeDispose(handleListeners)
    })

    useRender(() => {
      const children = computedItems.value.map(item => (
        <CVirtualScrollItem
          key={item.index}
          renderless={props.renderless}
          onUpdate:height={height => handleItemResize(item.index, height)}
        >
          { slotProps => slots.default?.({ item: item.raw, index: item.index, ...slotProps }) }
        </CVirtualScrollItem>
      ))

      return props.renderless
        ? (
          <>
            <div ref={markerRef} class="v-virtual-scroll__spacer" style={{ paddingTop: convertToUnit(paddingTop.value) }} />
            { children }
            <div class="v-virtual-scroll__spacer" style={{ paddingBottom: convertToUnit(paddingBottom.value) }} />
          </>
          )
        : (
          <div
            ref={containerRef}
            class={[
              'v-virtual-scroll',
              props.class,
            ]}
            onScrollPassive={handleScroll}
            onScrollend={handleScrollend}
            style={[
              dimensionStyles.value,
              props.style,
            ]}
          >
            <div
              ref={markerRef}
              class="v-virtual-scroll__container"
              style={{
                paddingTop: convertToUnit(paddingTop.value),
                paddingBottom: convertToUnit(paddingBottom.value),
              }}
            >
              { children }
            </div>
          </div>
          )
    })

    return {
      scrollToIndex,
    }
  },
})

export type CVirtualScroll = InstanceType<typeof CVirtualScroll>
