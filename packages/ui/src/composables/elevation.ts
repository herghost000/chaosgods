import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { propsFactory } from '@/util'

export interface ElevationProps {
  elevation?: number | string | null
}

// Composables
export const makeElevationProps = propsFactory({
  elevation: {
    type: [Number, String],
    validator(v: any) {
      const value = Number.parseInt(v)

      return (
        !Number.isNaN(value)
        && value >= 0
        // Material Design has a maximum elevation of 24
        // https://material.io/design/environment/elevation.html#default-elevations
        && value <= 24
      )
    },
  },
}, 'elevation')

interface ElevationData {
  elevationClasses: Ref<string[]>
}

export function useElevation(props: ElevationProps | Ref<number | string | undefined>): ElevationData {
  const elevationClasses = computed(() => {
    const elevation = isRef(props) ? props.value : props.elevation
    const classes: string[] = []

    if (elevation == null)
      return classes

    classes.push(`elevation-${elevation}`)

    return classes
  })

  return { elevationClasses }
}
