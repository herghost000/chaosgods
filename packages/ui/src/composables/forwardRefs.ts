import type { ComponentPublicInstance, Ref, UnwrapRef } from 'vue'
import type { UnionToIntersection } from '@/util'

const Refs = Symbol('Forwarded refs')

/**
 * @zh 从类型 T 中排除以指定前缀 P 开头的属性。
 * 如果没有以指定前缀开头的属性，则返回类型 T。
 *
 * @template T 要操作的原始类型。
 * @template P 属性名称的前缀字符串。
 * @returns {T | Omit<T, `${P}${any}`>} 返回排除指定前缀属性后的新类型。
 */
type OmitPrefix<T, P extends string> = [Extract<keyof T, `${P}${any}`>] extends [never] ? T : Omit<T, `${P}${any}`>

/**
 * @zh 如果类型 T 包含 $props 属性，则从 T 中排除 $props 中的属性。
 * 否则返回类型 T。
 *
 * @template T 要操作的原始类型。
 * @returns {Omit<T, keyof T['$props']>} 返回排除 $props 属性后的新类型。
 */
type OmitProps<T> = T extends { $props: any } ? Omit<T, keyof T['$props']> : T

/**
 * @zh 获取对象的属性描述符，支持原型链上的查找。
 *
 * @param {any} obj 要查找属性的对象。
 * @param {PropertyKey} key 要查找的属性键。
 * @returns {PropertyDescriptor | undefined} 返回指定属性的属性描述符，如果未找到则返回 undefined。
 */
function getDescriptor(obj: any, key: PropertyKey): PropertyDescriptor | undefined {
  let currentObj = obj
  while (currentObj) {
    const descriptor = Reflect.getOwnPropertyDescriptor(currentObj, key)
    if (descriptor)
      return descriptor
    currentObj = Object.getPrototypeOf(currentObj)
  }
  return undefined
}

/**
 * @zh 将多个 ref 对象的属性转发到一个目标对象上，并返回一个新的代理对象。
 *
 * @template T 目标对象的类型。
 * @template U 要转发的 ref 对象数组的类型。
 * @param {T} target 目标对象。
 * @param {...U} refs 要转发的 ref 对象数组。
 * @returns {T & UnionToIntersection<{ [K in keyof U]: OmitPrefix<OmitProps<NonNullable<UnwrapRef<U[K]>>>, '$'> }[number]>} 返回包含转发属性的代理对象。
 * @example
 * // 创建一个 ref 对象
 * const myRef = ref({ name: 'Alice' });
 *
 * // 创建一个目标对象
 * const targetObj = { age: 30 };
 *
 * // 将 ref 对象的属性转发到目标对象上
 * const proxyObj = forwardRefs(targetObj, myRef);
 *
 * // 访问转发后的属性
 * console.log(proxyObj.name); // 输出: Alice
 * console.log(proxyObj.age); // 输出: 30
 */
export function forwardRefs<T extends {}, U extends Ref<HTMLElement | Omit<ComponentPublicInstance, '$emit' | '$slots'> | undefined>[]>(
  target: T,
  ...refs: U
): T & UnionToIntersection<{ [K in keyof U]: OmitPrefix<OmitProps<NonNullable<UnwrapRef<U[K]>>>, '$'> }[number]> {
  (target as any)[Refs] = refs

  return new Proxy(target, {
    get(target, key) {
      if (Reflect.has(target, key))
        return Reflect.get(target, key)

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__'))
        return

      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key)) {
          const val = Reflect.get(ref.value, key)
          return typeof val === 'function'
            ? val.bind(ref.value)
            : val
        }
      }
    },
    has(target, key) {
      if (Reflect.has(target, key))
        return true

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__'))
        return false

      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key))
          return true
      }
      return false
    },
    set(target, key, value) {
      if (Reflect.has(target, key))
        return Reflect.set(target, key, value)

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__'))
        return false

      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key))
          return Reflect.set(ref.value, key, value)
      }

      return false
    },
    getOwnPropertyDescriptor(target, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key)
      if (descriptor)
        return descriptor

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__'))
        return

      // Check each ref's own properties
      for (const ref of refs) {
        if (!ref.value)
          continue
        const descriptor = getDescriptor(ref.value, key) ?? ('_' in ref.value ? getDescriptor((ref.value._ as any)?.setupState, key) : undefined)
        if (descriptor)
          return descriptor
      }

      // Recursive search up each ref's prototype
      for (const ref of refs) {
        const childRefs = ref.value && (ref.value as any)[Refs]
        if (!childRefs)
          continue
        const queue = childRefs.slice()
        while (queue.length) {
          const ref = queue.shift()
          const descriptor = getDescriptor(ref.value, key)
          if (descriptor)
            return descriptor
          const childRefs = ref.value && (ref.value as any)[Refs]
          if (childRefs)
            queue.push(...childRefs)
        }
      }

      return undefined
    },
  }) as any
}
