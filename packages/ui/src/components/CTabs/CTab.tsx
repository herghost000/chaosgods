import './CTab.sass'
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { CTabsSymbol } from './shared'
import { CBtn, makeCBtnProps } from '@/components/CBtn/CBtn'
import { useTextColor } from '@/composables/color'
import { forwardRefs } from '@/composables/forwardRefs'
import { animate, genericComponent, omit, propsFactory, standardEasing, useRender } from '@/util'
import type { CBtnSlots } from '@/components/CBtn/CBtn'

export const makeCTabProps = propsFactory({
  fixed: Boolean,

  sliderColor: String,
  hideSlider: Boolean,

  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },

  ...omit(makeCBtnProps({
    selectedClass: 'v-tab--selected',
    variant: 'text' as const,
  }), [
    'active',
    'block',
    'flat',
    'location',
    'position',
    'symbol',
  ]),
}, 'CTab')

export const CTab = genericComponent<CBtnSlots>()({
  name: 'CTab',

  props: makeCTabProps(),

  setup(props, { slots, attrs }) {
    const { textColorClasses: sliderColorClasses, textColorStyles: sliderColorStyles } = useTextColor(props, 'sliderColor')

    const rootEl = ref<CBtn>()
    const sliderEl = ref<HTMLElement>()

    const isHorizontal = computed(() => props.direction === 'horizontal')
    const isSelected = computed(() => rootEl.value?.group?.isSelected.value ?? false)

    function updateSlider({ value }: { value: boolean }) {
      if (value) {
        const prevEl: HTMLElement | undefined = rootEl.value?.$el.parentElement?.querySelector('.v-tab--selected .v-tab__slider')
        const nextEl = sliderEl.value

        if (!prevEl || !nextEl)
          return

        const color = getComputedStyle(prevEl).color

        const prevBox = prevEl.getBoundingClientRect()
        const nextBox = nextEl.getBoundingClientRect()

        const xy = isHorizontal.value ? 'x' : 'y'
        const XY = isHorizontal.value ? 'X' : 'Y'
        const rightBottom = isHorizontal.value ? 'right' : 'bottom'
        const widthHeight = isHorizontal.value ? 'width' : 'height'

        const prevPos = prevBox[xy]
        const nextPos = nextBox[xy]
        const delta = prevPos > nextPos
          ? prevBox[rightBottom] - nextBox[rightBottom]
          : prevBox[xy] - nextBox[xy]
        const origin
          = Math.sign(delta) > 0
            ? (isHorizontal.value ? 'right' : 'bottom')
            : Math.sign(delta) < 0
              ? (isHorizontal.value ? 'left' : 'top')
              : 'center'
        const size = Math.abs(delta) + (Math.sign(delta) < 0 ? prevBox[widthHeight] : nextBox[widthHeight])
        const scale = size / Math.max(prevBox[widthHeight], nextBox[widthHeight]) || 0
        const initialScale = prevBox[widthHeight] / nextBox[widthHeight] || 0

        const sigma = 1.5
        animate(nextEl, {
          backgroundColor: [color, 'currentcolor'],
          transform: [
            `translate${XY}(${delta}px) scale${XY}(${initialScale})`,
            `translate${XY}(${delta / sigma}px) scale${XY}(${(scale - 1) / sigma + 1})`,
            'none',
          ],
          transformOrigin: Array(3).fill(origin),
        }, {
          duration: 225,
          easing: standardEasing,
        })
      }
    }

    useRender(() => {
      const btnProps = CBtn.filterProps(props)

      return (
        <CBtn
          symbol={CTabsSymbol}
          ref={rootEl}
          class={[
            'v-tab',
            props.class,
          ]}
          style={props.style}
          tabindex={isSelected.value ? 0 : -1}
          role="tab"
          aria-selected={String(isSelected.value)}
          active={false}
          {...btnProps}
          {...attrs}
          block={props.fixed}
          maxWidth={props.fixed ? 300 : undefined}
          onGroup:selected={updateSlider}
        >
          {{
            ...slots,
            default: () => (
              <>
                { slots.default?.() ?? props.text }

                { !props.hideSlider && (
                  <div
                    ref={sliderEl}
                    class={[
                      'v-tab__slider',
                      sliderColorClasses.value,
                    ]}
                    style={sliderColorStyles.value}
                  />
                )}
              </>
            ),
          }}
        </CBtn>
      )
    })

    return forwardRefs({}, rootEl)
  },
})

export type CTab = InstanceType<typeof CTab>
