import 'vue/jsx'
import type { UnwrapNestedRefs, VNodeChild } from 'vue'
import type { Events, VNode } from 'vue'
// @skip-build
import type { ComponentPublicInstance } from 'vue'

// @skip-build
import type { DateInstance, DefaultsInstance, DisplayInstance, IconOptions, LocaleInstance, RtlInstance, ThemeInstance } from './framework'

declare global {
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

declare module 'vue' {
  export type JSXComponent<Props = any> = { new (): ComponentPublicInstance<Props> } | FunctionalComponent<Props>
  export interface App<HostElement = any> {
    $nuxt?: { hook: (name: string, fn: () => void) => void }
  }
  interface Chaos {
    defaults: DefaultsInstance
    display: UnwrapNestedRefs<DisplayInstance>
    theme: UnwrapNestedRefs<ThemeInstance>
    icons: IconOptions
    locale: UnwrapNestedRefs<LocaleInstance & RtlInstance>
    date: DateInstance
  }

  export interface ComponentCustomProperties {
    $chaos: Chaos
    _: ComponentInternalInstance
  }

  export interface ComponentInternalInstance {
    provides: Record<string | symbol, any>
    setupState: any
  }

  export interface FunctionalComponent {
    aliasName?: string
  }

  export interface ComponentOptionsBase<Props, RawBindings, D, C extends ComputedOptions, M extends MethodOptions, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin, E extends EmitsOptions, EE extends string = string, Defaults = {}> {
    aliasName?: string
  }

  export interface VNode {
    ctx: ComponentInternalInstance | null
    ssContent: VNode | null
  }

  type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

  type Combine<T extends string> = T | {
    [K in T]: {
      [L in Exclude<T, K>]: `${K}${Exclude<T, K>}` | `${K}${L}${Exclude<T, K | L>}`
    }[Exclude<T, K>]
  }[T]

  type Modifiers = Combine<'Passive' | 'Capture' | 'Once'>

  type ModifiedEvents = UnionToIntersection<{
    [K in keyof Events]: { [L in `${K}${Modifiers}`]: Events[K] }
  }[keyof Events]>

  type EventHandlers<E> = {
    [K in keyof E]?: E[K] extends Function ? E[K] : (payload: E[K]) => void
  }

  export interface HTMLAttributes extends EventHandlers<ModifiedEvents> {
    $children?: VNodeChild
    onScrollend?: (e: Event) => void
    disabled?: boolean
    value?: any
  }

  type CustomProperties = {
    [k in `--${string}`]: any
  }

  export interface CSSProperties extends CustomProperties {}

  export interface SVGAttributes {
    $children?: VNodeChild
  }

  export interface GlobalComponents {
    // @generate-components
  }
}
