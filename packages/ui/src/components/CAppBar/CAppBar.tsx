import './CAppBar.sass'
import { computed, ref, shallowRef, toRef, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { CToolbar, makeCToolbarProps } from '@/components/CToolbar/CToolbar'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { useProxiedModel } from '@/composables/proxiedModel'
import { makeScrollProps, useScroll } from '@/composables/scroll'
import { useSsrBoot } from '@/composables/ssrBoot'
import { useToggleScope } from '@/composables/toggleScope'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CToolbarSlots } from '@/components/CToolbar/CToolbar'

export const makeCAppBarProps = propsFactory({
  scrollBehavior: String as PropType<'hide' | 'inverted' | 'collapse' | 'elevate' | 'fade-image' | (string & {})>,
  modelValue: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String as PropType<'top' | 'bottom'>,
    default: 'top',
    validator: (value: any) => ['top', 'bottom'].includes(value),
  },

  ...makeCToolbarProps(),
  ...makeLayoutItemProps(),
  ...makeScrollProps(),

  height: {
    type: [Number, String],
    default: 64,
  },
}, 'CAppBar')

export const CAppBar = genericComponent<CToolbarSlots>()({
  name: 'CAppBar',

  props: makeCAppBarProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const vToolbarRef = ref<CToolbar>()
    const isActive = useProxiedModel(props, 'modelValue')
    const scrollBehavior = computed(() => {
      const behavior = new Set(props.scrollBehavior?.split(' ') ?? [])
      return {
        hide: behavior.has('hide'),
        fullyHide: behavior.has('fully-hide'),
        inverted: behavior.has('inverted'),
        collapse: behavior.has('collapse'),
        elevate: behavior.has('elevate'),
        fadeImage: behavior.has('fade-image'),
        // shrink: behavior.has('shrink'),
      }
    })
    const canScroll = computed(() => {
      const behavior = scrollBehavior.value
      return (
        behavior.hide
        || behavior.fullyHide
        || behavior.inverted
        || behavior.collapse
        || behavior.elevate
        || behavior.fadeImage
        // behavior.shrink ||
        || !isActive.value
      )
    })
    const {
      currentScroll,
      scrollThreshold,
      isScrollingUp,
      scrollRatio,
    } = useScroll(props, { canScroll })

    const canHide = computed(() => (
      scrollBehavior.value.hide
      || scrollBehavior.value.fullyHide
    ))
    const isCollapsed = computed(() => props.collapse || (
      scrollBehavior.value.collapse
      && (scrollBehavior.value.inverted ? scrollRatio.value > 0 : scrollRatio.value === 0)
    ))
    const isFlat = computed(() => props.flat || (
      scrollBehavior.value.fullyHide
      && !isActive.value
    ) || (
      scrollBehavior.value.elevate
      && (scrollBehavior.value.inverted ? currentScroll.value > 0 : currentScroll.value === 0)
    ))
    const opacity = computed(() => (
      scrollBehavior.value.fadeImage
        ? (scrollBehavior.value.inverted ? 1 - scrollRatio.value : scrollRatio.value)
        : undefined
    ))
    const height = computed(() => {
      const height = Number(vToolbarRef.value?.contentHeight ?? props.height)
      const extensionHeight = Number(vToolbarRef.value?.extensionHeight ?? 0)

      if (!canHide.value)
        return (height + extensionHeight)

      return currentScroll.value < scrollThreshold.value || scrollBehavior.value.fullyHide
        ? (height + extensionHeight)
        : height
    })

    useToggleScope(computed(() => !!props.scrollBehavior), () => {
      watchEffect(() => {
        if (canHide.value) {
          if (scrollBehavior.value.inverted)
            isActive.value = currentScroll.value > scrollThreshold.value
          else
            isActive.value = isScrollingUp.value || (currentScroll.value < scrollThreshold.value)
        }
        else {
          isActive.value = true
        }
      })
    })

    const { ssrBootStyles } = useSsrBoot()
    const { layoutItemStyles, layoutIsReady } = useLayoutItem({
      id: props.name,
      order: computed(() => Number.parseInt(`${props.order}`, 10)),
      position: toRef(props, 'location'),
      layoutSize: height,
      elementSize: shallowRef(undefined),
      active: isActive,
      absolute: toRef(props, 'absolute'),
    })

    useRender(() => {
      const toolbarProps = CToolbar.filterProps(props)

      return (
        <CToolbar
          ref={vToolbarRef}
          class={[
            'v-app-bar',
            {
              'v-app-bar--bottom': props.location === 'bottom',
            },
            props.class,
          ]}
          style={[
            {
              ...layoutItemStyles.value,
              '--v-toolbar-image-opacity': opacity.value,
              'height': undefined,
              ...ssrBootStyles.value,
            },
            props.style,
          ]}
          {...toolbarProps}
          collapse={isCollapsed.value}
          flat={isFlat.value}
          v-slots={slots}
        />
      )
    })

    return layoutIsReady
  },
})

export type CAppBar = InstanceType<typeof CAppBar>
