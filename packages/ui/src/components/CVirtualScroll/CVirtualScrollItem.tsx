import { watch } from 'vue'
import { makeComponentProps } from '@/composables/component'
import { useResizeObserver } from '@/composables/resizeObserver'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { GenericProps, TemplateRef } from '@/util'

export const makeCVirtualScrollItemProps = propsFactory({
  renderless: Boolean,

  ...makeComponentProps(),
}, 'CVirtualScrollItem')

export const CVirtualScrollItem = genericComponent<new<Renderless extends boolean = false>(
  props: {
    renderless?: Renderless
  },
  slots: {
    default: Renderless extends true ? {
      itemRef: TemplateRef
    } : never
  }
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CVirtualScrollItem',

  inheritAttrs: false,

  props: makeCVirtualScrollItemProps(),

  emits: {
    'update:height': (_height: number) => true,
  },

  setup(props, { attrs, emit, slots }) {
    const { resizeRef, contentRect } = useResizeObserver(undefined, 'border')

    watch(() => contentRect.value?.height, (height) => {
      if (height != null)
        emit('update:height', height)
    })

    useRender(() => props.renderless
      ? (
        <>
          { slots.default?.({ itemRef: resizeRef }) }
        </>
        )
      : (
        <div
          ref={resizeRef}
          class={[
            'v-virtual-scroll__item',
            props.class,
          ]}
          style={props.style}
          {...attrs}
        >
          { (slots.default as any)?.() }
        </div>
        ))
  },
})
