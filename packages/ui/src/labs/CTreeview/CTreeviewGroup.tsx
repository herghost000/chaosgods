import { computed, ref } from 'vue'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { CListGroup, makeCListGroupProps } from '@/components/CList/CListGroup'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { CListGroupSlots } from '@/components/CList/CListGroup'

export const makeCTreeviewGroupProps = propsFactory({
  ...omit(makeCListGroupProps({
    collapseIcon: '$treeviewCollapse',
    expandIcon: '$treeviewExpand',
  }), ['subgroup']),
}, 'CTreeviewGroup')

export const CTreeviewGroup = genericComponent<CListGroupSlots>()({
  name: 'CTreeviewGroup',

  props: makeCTreeviewGroupProps(),

  setup(props, { slots }) {
    const vListGroupRef = ref<CListGroup>()
    const toggleIcon = computed(() => vListGroupRef.value?.isOpen ? props.collapseIcon : props.expandIcon)

    const activatorDefaults = computed(() => ({
      CTreeviewItem: {
        prependIcon: undefined,
        appendIcon: undefined,
        active: vListGroupRef.value?.isOpen,
        toggleIcon: toggleIcon.value,
      },
    }))

    useRender(() => {
      const listGroupProps = CListGroup.filterProps(props)

      return (
        <CListGroup
          {...listGroupProps}
          ref={vListGroupRef}
          class={[
            'v-treeview-group',
            props.class,
          ]}
          subgroup
        >
          {{
            ...slots,
            activator: slots.activator
              ? slotProps => (
                <>
                  <CDefaultsProvider defaults={activatorDefaults.value}>
                    { slots.activator?.(slotProps) }
                  </CDefaultsProvider>
                </>
              )
              : undefined,
          }}
        </CListGroup>
      )
    })

    return {}
  },
})

export type CTreeviewGroup = InstanceType<typeof CTreeviewGroup>
