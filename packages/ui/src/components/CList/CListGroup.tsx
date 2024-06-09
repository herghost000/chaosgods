import { computed, toRef } from 'vue'
import { useList } from './list'
import { CExpandTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { makeComponentProps } from '@/composables/component'
import { IconValue } from '@/composables/icons'
import { useNestedGroupActivator, useNestedItem } from '@/composables/nested/nested'
import { useSsrBoot } from '@/composables/ssrBoot'
import { makeTagProps } from '@/composables/tag'
import { MaybeTransition } from '@/composables/transition'
import { defineComponent, genericComponent, propsFactory, useRender } from '@/util'

export type CListGroupSlots = {
  default: never
  activator: { isOpen: boolean, props: Record<string, unknown> }
}

const CListGroupActivator = defineComponent({
  name: 'CListGroupActivator',

  setup(_, { slots }) {
    useNestedGroupActivator()

    return () => slots.default?.()
  },
})

export const makeCListGroupProps = propsFactory({
  /* @deprecated */
  activeColor: String,
  baseColor: String,
  color: String,
  collapseIcon: {
    type: IconValue,
    default: '$collapse',
  },
  expandIcon: {
    type: IconValue,
    default: '$expand',
  },
  prependIcon: IconValue,
  appendIcon: IconValue,
  fluid: Boolean,
  subgroup: Boolean,
  title: String,
  value: null,

  ...makeComponentProps(),
  ...makeTagProps(),
}, 'CListGroup')

export const CListGroup = genericComponent<CListGroupSlots>()({
  name: 'CListGroup',

  props: makeCListGroupProps(),

  setup(props, { slots }) {
    const { isOpen, open, id: _id } = useNestedItem(toRef(props, 'value'), true)
    const id = computed(() => `v-list-group--id-${String(_id.value)}`)
    const list = useList()
    const { isBooted } = useSsrBoot()

    function onClick(e: Event) {
      open(!isOpen.value, e)
    }

    const activatorProps = computed(() => ({
      onClick,
      class: 'v-list-group__header',
      id: id.value,
    }))

    const toggleIcon = computed(() => isOpen.value ? props.collapseIcon : props.expandIcon)
    const activatorDefaults = computed(() => ({
      CListItem: {
        active: isOpen.value,
        activeColor: props.activeColor,
        baseColor: props.baseColor,
        color: props.color,
        prependIcon: props.prependIcon || (props.subgroup && toggleIcon.value),
        appendIcon: props.appendIcon || (!props.subgroup && toggleIcon.value),
        title: props.title,
        value: props.value,
      },
    }))

    useRender(() => (
      <props.tag
        class={[
          'v-list-group',
          {
            'v-list-group--prepend': list?.hasPrepend.value,
            'v-list-group--fluid': props.fluid,
            'v-list-group--subgroup': props.subgroup,
            'v-list-group--open': isOpen.value,
          },
          props.class,
        ]}
        style={props.style}
      >
        { slots.activator && (
          <CDefaultsProvider defaults={activatorDefaults.value}>
            <CListGroupActivator>
              { slots.activator({ props: activatorProps.value, isOpen: isOpen.value }) }
            </CListGroupActivator>
          </CDefaultsProvider>
        )}

        <MaybeTransition transition={{ component: CExpandTransition }} disabled={!isBooted.value}>
          <div class="v-list-group__items" role="group" aria-labelledby={id.value} v-show={isOpen.value}>
            { slots.default?.() }
          </div>
        </MaybeTransition>
      </props.tag>
    ))

    return {
      isOpen,
    }
  },
})

export type CListGroup = InstanceType<typeof CListGroup>
