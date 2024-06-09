import './CBtnGroup.sass'
import { toRef } from 'vue'
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeComponentProps } from '@/composables/component'
import { provideDefaults } from '@/composables/defaults'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeVariantProps } from '@/composables/variant'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCBtnGroupProps = propsFactory(
  {
    baseColor: String,
    divided: Boolean,

    ...makeBorderProps(),
    ...makeComponentProps(),
    ...makeDensityProps(),
    ...makeElevationProps(),
    ...makeRoundedProps(),
    ...makeTagProps(),
    ...makeThemeProps(),
    ...makeVariantProps(),
  },
  'CBtnGroup',
)

export const CBtnGroup = genericComponent()({
  name: 'CBtnGroup',

  props: makeCBtnGroupProps(),

  setup(props, { slots }) {
    const { themeClasses } = provideTheme(props)
    const { densityClasses } = useDensity(props)
    const { borderClasses } = useBorder(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)

    provideDefaults({
      CBtn: {
        height: 'auto',
        baseColor: toRef(props, 'baseColor'),
        color: toRef(props, 'color'),
        density: toRef(props, 'density'),
        flat: true,
        variant: toRef(props, 'variant'),
      },
    })

    useRender(() => {
      return (
        <props.tag
          class={[
            'v-btn-group',
            {
              'v-btn-group--divided': props.divided,
            },
            themeClasses.value,
            borderClasses.value,
            densityClasses.value,
            elevationClasses.value,
            roundedClasses.value,
            props.class,
          ]}
          style={props.style}
          v-slots={slots}
        />
      )
    })
  },
})

export type CBtnGroup = InstanceType<typeof CBtnGroup>
