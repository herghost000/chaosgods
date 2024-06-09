import './CMenu.sass'
import { computed, inject, mergeProps, nextTick, provide, ref, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { CMenuSymbol } from './shared'
import { CDialogTransition } from '@/components/transitions'
import { CDefaultsProvider } from '@/components/CDefaultsProvider'
import { COverlay } from '@/components/COverlay'
import { makeCOverlayProps } from '@/components/COverlay/COverlay'
import { forwardRefs } from '@/composables/forwardRefs'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useScopeId } from '@/composables/scopeId'
import {
  focusChild,
  focusableChildren,
  genericComponent,
  getNextElement,
  getUid,
  isClickInsideElement,
  omit,
  propsFactory,
  useRender,
} from '@/util'
import type { OverlaySlots } from '@/components/COverlay/COverlay'

export const makeCMenuProps = propsFactory({
  // TODO
  // disableKeys: Boolean,
  id: String,

  ...omit(makeCOverlayProps({
    closeDelay: 250,
    closeOnContentClick: true,
    locationStrategy: 'connected' as const,
    openDelay: 300,
    scrim: false,
    scrollStrategy: 'reposition' as const,
    transition: { component: CDialogTransition as Component },
  }), ['absolute']),
}, 'CMenu')

export const CMenu = genericComponent<OverlaySlots>()({
  name: 'CMenu',

  props: makeCMenuProps(),

  emits: {
    'update:modelValue': (_value: boolean) => true,
  },

  setup(props, { slots }) {
    const isActive = useProxiedModel(props, 'modelValue')
    const { scopeId } = useScopeId()

    const uid = getUid()
    const id = computed(() => props.id || `v-menu-${uid}`)

    const overlay = ref<COverlay>()

    const parent = inject(CMenuSymbol, null)
    const openChildren = shallowRef(0)
    provide(CMenuSymbol, {
      register() {
        ++openChildren.value
      },
      unregister() {
        --openChildren.value
      },
      closeParents(e) {
        setTimeout(() => {
          if (!openChildren.value
            && !props.persistent
            && (e == null || (e && !isClickInsideElement(e, overlay.value!.contentEl!)))
          ) {
            isActive.value = false
            parent?.closeParents()
          }
        }, 40)
      },
    })

    async function onFocusIn(e: FocusEvent) {
      const before = e.relatedTarget as HTMLElement | null
      const after = e.target as HTMLElement | null

      await nextTick()

      if (
        isActive.value
        && before !== after
        && overlay.value?.contentEl
        // We're the topmost menu
        && overlay.value?.globalTop
        // It isn't the document or the menu body
        && ![document, overlay.value.contentEl].includes(after!)
        // It isn't inside the menu body
        && !overlay.value.contentEl.contains(after)
      ) {
        const focusable = focusableChildren(overlay.value.contentEl)
        focusable[0]?.focus()
      }
    }

    watch(isActive, (val) => {
      if (val) {
        parent?.register()
        document.addEventListener('focusin', onFocusIn, { once: true })
      }
      else {
        parent?.unregister()
        document.removeEventListener('focusin', onFocusIn)
      }
    })

    function onClickOutside(e: MouseEvent) {
      parent?.closeParents(e)
    }

    function onKeydown(e: KeyboardEvent) {
      if (props.disabled)
        return

      if (e.key === 'Tab' || (e.key === 'Enter' && !props.closeOnContentClick)) {
        if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement)
          return
        if (e.key === 'Enter')
          e.preventDefault()

        const nextElement = getNextElement(
          focusableChildren(overlay.value?.contentEl as Element, false),
          e.shiftKey ? 'prev' : 'next',
          (el: HTMLElement) => el.tabIndex >= 0,
        )
        if (!nextElement) {
          isActive.value = false
          overlay.value?.activatorEl?.focus()
        }
      }
      else if (['Enter', ' '].includes(e.key) && props.closeOnContentClick) {
        isActive.value = false
        parent?.closeParents()
      }
    }

    function onActivatorKeydown(e: KeyboardEvent) {
      if (props.disabled)
        return

      const el = overlay.value?.contentEl
      if (el && isActive.value) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          focusChild(el, 'next')
        }
        else if (e.key === 'ArrowUp') {
          e.preventDefault()
          focusChild(el, 'prev')
        }
      }
      else if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        isActive.value = true
        e.preventDefault()
        setTimeout(() => setTimeout(() => onActivatorKeydown(e)))
      }
    }

    const activatorProps = computed(() =>
      mergeProps({
        'aria-haspopup': 'menu',
        'aria-expanded': String(isActive.value),
        'aria-owns': id.value,
        'onKeydown': onActivatorKeydown,
      }, props.activatorProps),
    )

    useRender(() => {
      const overlayProps = COverlay.filterProps(props)

      return (
        <COverlay
          ref={overlay}
          id={id.value}
          class={[
            'v-menu',
            props.class,
          ]}
          style={props.style}
          {...overlayProps}
          v-model={isActive.value}
          absolute
          activatorProps={activatorProps.value}
          onClick:outside={onClickOutside}
          onKeydown={onKeydown}
          {...scopeId}
        >
          {{
            activator: slots.activator,
            default: (...args) => (
              <CDefaultsProvider root="CMenu">
                { slots.default?.(...args) }
              </CDefaultsProvider>
            ),
          }}
        </COverlay>
      )
    })

    return forwardRefs({ id, ΨopenChildren: openChildren }, overlay)
  },
})

export type CMenu = InstanceType<typeof CMenu>
