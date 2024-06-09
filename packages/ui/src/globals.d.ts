/* eslint-disable ts/method-signature-style */
import 'vue/jsx'
import type { VNode } from 'vue'
import type { TouchStoredHandlers } from './directives/touch'

declare global {
  interface HTMLCollection {
    [Symbol.iterator] (): IterableIterator<Element>
  }

  interface Element {
    _clickOutside?: Record<number, {
      onClick: EventListener
      onMousedown: EventListener
    } | undefined> & { lastMousedownWasOutside: boolean }
    _onResize?: Record<number, {
      handler: () => void
      options: AddEventListenerOptions
    } | undefined>
    _ripple?: {
      enabled?: boolean
      centered?: boolean
      class?: string
      circle?: boolean
      touched?: boolean
      isTouch?: boolean
      showTimer?: number
      showTimerCommit?: (() => void) | null
    }
    _observe?: Record<number, {
      init: boolean
      observer: IntersectionObserver
    } | undefined>
    _mutate?: Record<number, {
      observer: MutationObserver
    } | undefined>
    _onScroll?: Record<number, {
      handler: EventListenerOrEventListenerObject
      options: AddEventListenerOptions
      target?: EventTarget
    } | undefined>
    _touchHandlers?: {
      [_uid: number]: TouchStoredHandlers
    }
    _transitionInitialStyles?: {
      position: string
      top: string
      left: string
      width: string
      height: string
    }

    getElementsByClassName(classNames: string): NodeListOf<HTMLElement>
  }

  interface WheelEvent {
    path?: EventTarget[]
  }

  interface MouseEvent {
    sourceCapabilities?: { firesTouchEvents: boolean }
  }

  interface ColorSelectionOptions {
    signal?: AbortSignal
  }

  interface ColorSelectionResult {
    sRGBHex: string
  }

  interface EyeDropper {
    open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>
  }

  interface EyeDropperConstructor {
    new (): EyeDropper
  }

  interface Window {
    EyeDropper: EyeDropperConstructor
  }

  function parseInt(s: string | number, radix?: number): number
  function parseFloat(string: string | number): number

  export const __VUETIFY_VERSION__: string
  export const __REQUIRED_VUE__: string
  export const __VUE_OPTIONS_API__: boolean | undefined

  namespace JSX {
    interface ElementChildrenAttribute {
      $children: {}
    }
    interface Element extends VNode {}
    interface IntrinsicAttributes {
      [name: string]: any
    }
  }
}

declare module 'expect' {
  interface Matchers<R> {
    /** console.warn */
    toHaveBeenTipped(): R

    /** console.error */
    toHaveBeenWarned(): R
  }
}
