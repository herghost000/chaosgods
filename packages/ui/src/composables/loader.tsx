import { computed } from 'vue'
import type { ExtractPropTypes, SetupContext } from 'vue'
import { CProgressLinear } from '@/components/CProgressLinear'
import { getCurrentInstanceName, propsFactory } from '@/util'
import type { SlotsToProps } from '@/util'

export interface LoaderSlotProps {
  color: string | undefined
  isActive: boolean
}

export interface LoaderProps {
  loading?: boolean | string
}

// Composables
export const makeLoaderProps = propsFactory({
  loading: [Boolean, String],
}, 'loader')

export function useLoader(
  props: LoaderProps,
  name = getCurrentInstanceName(),
) {
  const loaderClasses = computed(() => ({
    [`${name}--loading`]: props.loading,
  }))

  return { loaderClasses }
}

export function LoaderSlot(
  props: {
    absolute?: boolean
    active: boolean
    name: string
    color?: string
  } & ExtractPropTypes<SlotsToProps<{
    default: LoaderSlotProps
  }>>,
  { slots }: SetupContext,
) {
  return (
    <div class={`${props.name}__loader`}>
      { slots.default?.({
        color: props.color,
        isActive: props.active,
      } as LoaderSlotProps) || (
        <CProgressLinear
          absolute={props.absolute}
          active={props.active}
          color={props.color}
          height="2"
          indeterminate
        />
      )}
    </div>
  )
}
