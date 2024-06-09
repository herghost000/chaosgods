import { computed, inject, provide, ref, shallowRef, unref, watchEffect } from 'vue'
import type { ComputedRef, InjectionKey, Ref, VNode } from 'vue'
import { getCurrentInstance, injectSelf, mergeDeep, toKebabCase } from '@/util'
import type { MaybeRef } from '@/util'

/**
 * @zh 表示默认配置的类型定义，可以是 undefined 或包含各个配置项的对象。
 */
export type DefaultsInstance = undefined | {
  /**
   * @zh 默认配置项的键值对集合，每个配置项可以是一个对象或 undefined。
   */
  [key: string]: undefined | Record<string, unknown>
  /**
   * @zh 全局默认配置项，存储全局通用的配置信息。
   */
  global?: Record<string, unknown>
}

/**
 * @zh 表示默认配置选项的类型定义，可以是默认配置实例的部分。
 */
export type DefaultsOptions = Partial<DefaultsInstance>

/**
 * @zh Vue 注入键，用于在应用程序中访问默认配置信息。
 */
export const DefaultsSymbol: InjectionKey<Ref<DefaultsInstance>> = Symbol.for('chaos:defaults')

/**
 * @zh 创建一个用于管理默认配置的 Vue 注入键和工具函数。
 * @en Create a Vue injection key and utility functions for managing default configurations.
 *
 * @param {DefaultsOptions} [options] 默认配置选项，用于初始化默认配置。
 * @returns {Ref<DefaultsInstance>} 返回一个响应式引用，包含默认配置信息。
 * @example
 * // 在主应用程序入口处创建默认配置
 * import { createApp } from 'vue';
 * import { createDefaults, DefaultsSymbol } from '@/util/defaults';
 *
 * const defaults = createDefaults({
 *   global: {
 *     theme: 'light',
 *     fontSize: 16,
 *   },
 * });
 *
 * const app = createApp(App);
 * app.provide(DefaultsSymbol, defaults);
 * app.mount('#app');
 *
 * // 在组件中使用默认配置
 * import { inject } from 'vue';
 * import { DefaultsSymbol } from '@/util/defaults';
 *
 * setup() {
 *   // 注入默认配置
 *   const defaults = inject(DefaultsSymbol);
 *
 *   // 获取全局主题
 *   const theme = defaults?.value.global?.theme;
 *
 *   return { theme };
 * }
 */
export function createDefaults(options?: DefaultsInstance): Ref<DefaultsInstance> {
  return ref(options)
}

/**
 * @zh 从 Vue 注入系统中获取默认配置实例。如果未找到默认配置实例，则抛出错误。
 * @en Retrieves the default configuration instance from the Vue injection system.
 * Throws an error if the default configuration instance is not found.
 *
 * @returns {Ref<DefaultsInstance>} 默认配置实例的响应式引用。
 * @throws {Error} 当未找到默认配置实例时抛出错误。
 */
export function injectDefaults(): Ref<DefaultsInstance> {
  const defaults = inject(DefaultsSymbol)

  if (!defaults)
    throw new Error('[Chaos] Could not find defaults instance')

  return defaults
}

/**
 * @zh 提供默认配置到 Vue 注入系统中。
 *
 * @param {MaybeRef<DefaultsInstance | undefined>} [defaults] 要提供的默认配置实例，可以是一个响应式引用。
 * @param {{ disabled?: MaybeRef<boolean | undefined>, reset?: MaybeRef<number | string | undefined>, root?: MaybeRef<boolean | string | undefined>, scoped?: MaybeRef<boolean | undefined> }} [options] 提供默认配置的选项。
 * @returns {ComputedRef<DefaultsInstance>} 返回一个计算属性，表示提供到 Vue 注入系统中的默认配置。
 */
export function provideDefaults(
  defaults?: MaybeRef<DefaultsInstance | undefined>,
  options?: {
    disabled?: MaybeRef<boolean | undefined>
    reset?: MaybeRef<number | string | undefined>
    root?: MaybeRef<boolean | string | undefined>
    scoped?: MaybeRef<boolean | undefined>
  },
): ComputedRef<DefaultsInstance> {
  const injectedDefaults = injectDefaults()
  const providedDefaults = ref(defaults)

  const newDefaults = computed(() => {
    const disabled = unref(options?.disabled)

    if (disabled)
      return injectedDefaults.value

    const scoped = unref(options?.scoped)
    const reset = unref(options?.reset)
    const root = unref(options?.root)

    if (providedDefaults.value == null && !(scoped || reset || root))
      return injectedDefaults.value

    let properties = mergeDeep(providedDefaults.value, { prev: injectedDefaults.value })

    if (scoped)
      return properties

    // @zh 如果指定了重置次数或根配置，则根据指定的重置次数或根配置进行处理
    if (reset || root) {
      const len = Number(reset || Number.POSITIVE_INFINITY)

      for (let i = 0; i <= len; i++) {
        if (!properties || !('prev' in properties))
          break

        properties = properties.prev
      }

      if (properties && typeof root === 'string' && root in properties)
        properties = mergeDeep(mergeDeep(properties, { prev: properties }), properties[root])

      return properties
    }

    return properties.prev
      ? mergeDeep(properties.prev, properties)
      : properties
  }) as ComputedRef<DefaultsInstance>

  provide(DefaultsSymbol, newDefaults)

  return newDefaults
}

/**
 * @zh 检查 VNode 上是否定义了指定的 prop。
 * @en Checks whether a prop is defined on a VNode.
 *
 * @param {VNode} vnode 要检查的 VNode。
 * @param {string} prop 要检查的 prop 名称。
 * @returns {boolean} 如果 VNode 上定义了指定的 prop，则返回 true，否则返回 false。
 */
function propIsDefined(vnode: VNode, prop: string): boolean {
  return typeof vnode.props?.[prop] !== 'undefined'
    || typeof vnode.props?.[toKebabCase(prop)] !== 'undefined'
}

/**
 * @zh 提供用于组件内部使用的管理默认配置的实用函数。
 * @en Provides utility functions for internal use in managing default configurations within components.
 *
 * @param {Record<string, any>} [props] 组件 props 的对象。
 * @param {string} [name] 组件的名称。
 * @param {Ref<DefaultsInstance>} [defaults] 包含默认配置的 Ref 对象。
 * @returns {object} 包含 props 和用于提供默认配置的函数。
 * @example
 * import { internalUseDefaults } from '@/util/defaults';
 *
 * setup(props) {
 *   const { props: _props, provideSubDefaults } = internalUseDefaults(props);
 *   provideSubDefaults();
 *
 *   // Access the modified props
 *   return { _props };
 * }
 */
export function internalUseDefaults(
  props: Record<string, any> = {},
  name?: string,
  defaults: Ref<DefaultsInstance> = injectDefaults(),
): {
    props: Record<string, any>
    provideSubDefaults: () => void
  } {
  const vm = getCurrentInstance('useDefaults')

  name = name ?? vm.type.name ?? vm.type.__name
  if (!name)
    throw new Error('[Chaos] Could not determine component name')

  const componentDefaults = computed(() => defaults.value?.[props._as ?? name])
  const _props = new Proxy(props, {
    get(target, prop) {
      const propValue = Reflect.get(target, prop)
      if (prop === 'class' || prop === 'style')
        return [componentDefaults.value?.[prop], propValue].filter(v => v != null)
      else if (typeof prop === 'string' && !propIsDefined(vm.vnode, prop))
        return componentDefaults.value?.[prop] ?? defaults.value?.global?.[prop] ?? propValue

      return propValue
    },
  })

  const _subcomponentDefaults = shallowRef()
  watchEffect(() => {
    if (componentDefaults.value) {
      const subComponents = Object.entries(componentDefaults.value).filter(([key]) => key.startsWith(key[0].toUpperCase()))
      _subcomponentDefaults.value = subComponents.length ? Object.fromEntries(subComponents) : undefined
    }
    else {
      _subcomponentDefaults.value = undefined
    }
  })

  /**
   * @zh 通过将子组件默认配置与注入的默认配置合并，提供子组件默认配置。
   * @en Provides subcomponent defaults by merging them with the injected defaults.
   */
  function provideSubDefaults() {
    const injected = injectSelf(DefaultsSymbol, vm)
    provide(DefaultsSymbol, computed(() => {
      return _subcomponentDefaults.value
        ? mergeDeep(
          injected?.value ?? {},
          _subcomponentDefaults.value,
        )
        : injected?.value
    }))
  }

  return { props: _props, provideSubDefaults }
}

/**
 * @zh 用于在组件内部管理默认配置的钩子函数。
 * @en Hook for managing default configurations within components.
 *
 * @param {Record<string, any>} [props] 包含组件 props 的 props 对象。
 * @param {string} [name] 组件的名称。
 * @returns {T | Record<string, any>} 包含 props 和管理默认配置的实用函数的对象。
 * @example
 * import { useDefaults } from '@/util/defaults';
 *
 * setup(props) {
 *   const _props = useDefaults(props);
 *
 *   // 访问修改后的 props
 *   return { _props };
 * }
 */
export function useDefaults<T extends Record<string, any>>(props: T, name?: string): T
export function useDefaults(props?: undefined, name?: string): Record<string, any>
export function useDefaults(
  props: Record<string, any> = {},
  name?: string,
) {
  const { props: _props, provideSubDefaults } = internalUseDefaults(props, name)
  provideSubDefaults()
  return _props
}
