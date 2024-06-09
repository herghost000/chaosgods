import { CImg, makeCImgProps } from '@/components/CImg/CImg'
import { CWindowItem, makeCWindowItemProps } from '@/components/CWindow/CWindowItem'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CImgSlots } from '@/components/CImg/CImg'

export const makeCCarouselItemProps = propsFactory({
  ...makeCImgProps(),
  ...makeCWindowItemProps(),
}, 'CCarouselItem')

export const CCarouselItem = genericComponent<CImgSlots>()({
  name: 'CCarouselItem',

  inheritAttrs: false,

  props: makeCCarouselItemProps(),

  setup(props, { slots, attrs }) {
    useRender(() => {
      const imgProps = CImg.filterProps(props)
      const windowItemProps = CWindowItem.filterProps(props)

      return (
        <CWindowItem
          class={[
            'v-carousel-item',
            props.class,
          ]}
          {...windowItemProps}
        >
          <CImg
            {...attrs}
            {...imgProps}
            v-slots={slots}
          />
        </CWindowItem>
      )
    })
  },
})

export type CCarouselItem = InstanceType<typeof CCarouselItem>
