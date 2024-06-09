import './CFooter.sass'
import { computed, shallowRef, toRef } from 'vue'
import { makeBorderProps, useBorder } from '@/composables/border'
import { useBackgroundColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { useResizeObserver } from '@/composables/resizeObserver'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { convertToUnit, genericComponent, propsFactory, useRender } from '@/util'

export const makeCFooterProps = propsFactory({
  app: Boolean,
  color: String,
  height: {
    type: [Number, String],
    default: 'auto',
  },

  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeElevationProps(),
  ...makeLayoutItemProps(),
  ...makeRoundedProps(),
  ...makeTagProps({ tag: 'footer' }),
  ...makeThemeProps(),
}, 'CFooter')

export const CFooter = genericComponent()({
  name: 'CFooter',

  props: makeCFooterProps(),

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'color'))
    const { borderClasses } = useBorder(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)

    const autoHeight = shallowRef(32)
    const { resizeRef } = useResizeObserver((entries) => {
      if (!entries.length)
        return
      autoHeight.value = entries[0].target.clientHeight
    })
    const height = computed(() => props.height === 'auto' ? autoHeight.value : Number.parseInt(`${props.height}`, 10))
    const { layoutItemStyles, layoutIsReady } = useLayoutItem({
      id: props.name,
      order: computed(() => Number.parseInt(`${props.order}`, 10)),
      position: computed(() => 'bottom'),
      layoutSize: height,
      elementSize: computed(() => props.height === 'auto' ? undefined : height.value),
      active: computed(() => props.app),
      absolute: toRef(props, 'absolute'),
    })

    useRender(() => (
      <props.tag
        ref={resizeRef}
        class={[
          'v-footer',
          themeClasses.value,
          backgroundColorClasses.value,
          borderClasses.value,
          elevationClasses.value,
          roundedClasses.value,
          props.class,
        ]}
        style={[
          backgroundColorStyles.value,
          props.app
            ? layoutItemStyles.value
            : {
                height: convertToUnit(props.height),
              },
          props.style,
        ]}
        v-slots={slots}
      />
    ))

    return props.app ? layoutIsReady : {}
  },
})

export type CFooter = InstanceType<typeof CFooter>
