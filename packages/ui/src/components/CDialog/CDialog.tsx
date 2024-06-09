import './CDialog.sass'
import { mergeProps, nextTick, ref, watch } from 'vue'
import type { Component } from 'vue'
import { CDialogTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { COverlay } from '@/components/COverlay'
import { makeCOverlayProps } from '@/components/COverlay/COverlay'
import { forwardRefs } from '@/composables/forwardRefs'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useScopeId } from '@/composables/scopeId'
import { IN_BROWSER, focusableChildren, genericComponent, propsFactory, useRender } from '@/util'
import type { OverlaySlots } from '@/components/COverlay/COverlay'

export const makeCDialogProps = propsFactory({
  fullscreen: Boolean,
  retainFocus: {
    type: Boolean,
    default: true,
  },
  scrollable: Boolean,

  ...makeCOverlayProps({
    origin: 'center center' as const,
    scrollStrategy: 'block' as const,
    transition: { component: CDialogTransition as Component },
    zIndex: 2400,
  }),
}, 'CDialog')

export const CDialog = genericComponent<OverlaySlots>()({
  name: 'CDialog',

  props: makeCDialogProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
    'afterLeave': () => true,
  },

  setup(props, { emit, slots }) {
    const isActive = useProxiedModel(props, 'modelValue')
    const { scopeId } = useScopeId()

    const overlay = ref<COverlay>()
    function onFocusin(e: FocusEvent) {
      const before = e.relatedTarget as HTMLElement | null
      const after = e.target as HTMLElement | null

      if (
        before !== after
        && overlay.value?.contentEl
        // We're the topmost dialog
        && overlay.value?.globalTop
        // It isn't the document or the dialog body
        && ![document, overlay.value.contentEl].includes(after!)
        // It isn't inside the dialog body
        && !overlay.value.contentEl.contains(after)
      ) {
        const focusable = focusableChildren(overlay.value.contentEl)

        if (!focusable.length)
          return

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (before === firstElement)
          lastElement.focus()
        else
          firstElement.focus()
      }
    }

    if (IN_BROWSER) {
      watch(() => isActive.value && props.retainFocus, (val) => {
        val
          ? document.addEventListener('focusin', onFocusin)
          : document.removeEventListener('focusin', onFocusin)
      }, { immediate: true })
    }

    function onAfterEnter() {
      if (overlay.value?.contentEl && !overlay.value.contentEl.contains(document.activeElement))
        overlay.value.contentEl.focus({ preventScroll: true })
    }

    function onAfterLeave() {
      emit('afterLeave')
    }

    watch(isActive, async (val) => {
      if (!val) {
        await nextTick()
        overlay.value!.activatorEl?.focus({ preventScroll: true })
      }
    })

    useRender(() => {
      const overlayProps = COverlay.filterProps(props)
      const activatorProps = mergeProps({
        'aria-haspopup': 'dialog',
        'aria-expanded': String(isActive.value),
      }, props.activatorProps)
      const contentProps = mergeProps({
        tabindex: -1,
      }, props.contentProps)

      return (
        <COverlay
          ref={overlay}
          class={[
            'v-dialog',
            {
              'v-dialog--fullscreen': props.fullscreen,
              'v-dialog--scrollable': props.scrollable,
            },
            props.class,
          ]}
          style={props.style}
          {...overlayProps}
          v-model={isActive.value}
          aria-modal="true"
          activatorProps={activatorProps}
          contentProps={contentProps}
          role="dialog"
          onAfterEnter={onAfterEnter}
          onAfterLeave={onAfterLeave}
          {...scopeId}
        >
          {{
            activator: slots.activator,
            default: (...args) => (
              <CDefaultsProvider root="CDialog">
                { slots.default?.(...args) }
              </CDefaultsProvider>
            ),
          }}
        </COverlay>
      )
    })

    return forwardRefs({}, overlay)
  },
})

export type CDialog = InstanceType<typeof CDialog>
