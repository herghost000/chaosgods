import './CExpansionPanel.sass'
import { computed, toRef } from 'vue'
import type { InjectionKey, PropType } from 'vue'
import { makeCExpansionPanelProps } from './CExpansionPanel'
import { provideDefaults } from '@/composables/defaults'
import { makeGroupProps, useGroup } from '@/composables/group'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { GroupItemProvide } from '@/composables/group'

export const CExpansionPanelSymbol: InjectionKey<GroupItemProvide> = Symbol.for('chaos:v-expansion-panel')

const allowedVariants = ['default', 'accordion', 'inset', 'popout'] as const

type Variant = typeof allowedVariants[number]

export type CExpansionPanelSlot = {
  prev: () => void
  next: () => void
}

export type CExpansionPanelSlots = {
  default: CExpansionPanelSlot
}

export const makeCExpansionPanelsProps = propsFactory({
  flat: Boolean,

  ...makeGroupProps(),
  ...makeCExpansionPanelProps(),
  ...makeThemeProps(),

  variant: {
    type: String as PropType<Variant>,
    default: 'default',
    validator: (v: any) => allowedVariants.includes(v),
  },
}, 'CExpansionPanels')

export const CExpansionPanels = genericComponent<CExpansionPanelSlots>()({
  name: 'CExpansionPanels',

  props: makeCExpansionPanelsProps(),

  emits: {
    'update:modelValue': (_val: unknown) => true,
  },

  setup(props, { slots }) {
    const { next, prev } = useGroup(props, CExpansionPanelSymbol)

    const { themeClasses } = provideTheme(props)

    const variantClass = computed(() => props.variant && `v-expansion-panels--variant-${props.variant}`)

    provideDefaults({
      CExpansionPanel: {
        bgColor: toRef(props, 'bgColor'),
        collapseIcon: toRef(props, 'collapseIcon'),
        color: toRef(props, 'color'),
        eager: toRef(props, 'eager'),
        elevation: toRef(props, 'elevation'),
        expandIcon: toRef(props, 'expandIcon'),
        focusable: toRef(props, 'focusable'),
        hideActions: toRef(props, 'hideActions'),
        readonly: toRef(props, 'readonly'),
        ripple: toRef(props, 'ripple'),
        rounded: toRef(props, 'rounded'),
        static: toRef(props, 'static'),
      },
    })

    useRender(() => (
      <props.tag
        class={[
          'v-expansion-panels',
          {
            'v-expansion-panels--flat': props.flat,
            'v-expansion-panels--tile': props.tile,
          },
          themeClasses.value,
          variantClass.value,
          props.class,
        ]}
        style={props.style}
      >
        { slots.default?.({ prev, next }) }
      </props.tag>
    ))

    return {
      next,
      prev,
    }
  },
})

export type CExpansionPanels = InstanceType<typeof CExpansionPanels>
