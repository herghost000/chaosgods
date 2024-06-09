import { Comment, Fragment, capitalize, computed, isVNode, reactive, readonly, shallowRef, toRefs, unref, watchEffect } from 'vue'
import type {
  ComponentInternalInstance,
  ComponentPublicInstance,
  ComputedGetter,
  InjectionKey,
  PropType,
  Ref,
  ToRefs,
  VNode,
  VNodeArrayChildren,
  VNodeChild,
  WatchOptions,
} from 'vue'
import { IN_BROWSER } from '@/util/globals'

/**
 * @zh 获取嵌套对象中指定路径的值。
 * @en The function retrieves the value of a specified path within a nested object.
 *
 * @export
 * @param {*} obj 要获取值的嵌套对象。
 * @param {((string | number)[])} path 要访问的路径，可以是字符串或数字组成的数组。
 * @param {*} [fallback] 当找不到值时要返回的默认值（可选）。
 * @return {*}  {*} 返回指定路径的值，如果路径不存在则返回默认值。
 */
export function getNestedValue(obj: any, path: (string | number)[], fallback?: any): any {
  const last = path.length - 1

  if (last < 0)
    return obj === undefined ? fallback : obj

  for (let i = 0; i < last; i++) {
    if (obj == null)
      return fallback

    obj = obj[path[i]]
  }

  if (obj == null)
    return fallback

  return obj[path[last]] === undefined ? fallback : obj[path[last]]
}

/**
 * @zh 检查两个值是否深度相等。
 * @en Checks if two values are deeply equal.
 *
 * @export
 * @param {*} a 要比较的第一个值
 * @param {*} b 要比较的第二个值。
 * @return {*}  {boolean} 如果值深度相等，则返回 true，否则返回 false。
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b)
    return true

  if (
    a instanceof Date
    && b instanceof Date
    && a.getTime() !== b.getTime()
  ) {
    // @zh 如果值是日期，则将它们比较为时间戳
    // @en If the values are Date, compare them as timestamps
    return false
  }

  if (a !== Object(a) || b !== Object(b)) {
    // @zh 如果值不是对象，则它们已经被检查过相等性
    // @en If the values aren't objects, they were already checked for equality
    return false
  }

  const props = Object.keys(a)

  if (props.length !== Object.keys(b).length) {
    // @zh 属性数量不同，无需继续检查
    // @en Different number of props, don't bother to check
    return false
  }

  return props.every(p => deepEqual(a[p], b[p]))
}

/**
 * @zh 通过路径获取对象中的属性值。
 *
 * @export
 * @param {*} obj 要获取属性值的对象。
 * @param {(string | null)} [path] 属性路径，可以是字符串或 null。
 * @param {*} [fallback] 默认值（可选）。
 * @return {*}  {*} 返回属性值，如果未找到则返回默认值。
 */
export function getObjectValueByPath(obj: any, path?: string | null, fallback?: any): any {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  if (obj == null || !path || typeof path !== 'string')
    return fallback
  if (obj[path] !== undefined)
    return obj[path]
  // @zh 将路径中的索引转换为属性
  // @en convert indexes to properties
  path = path.replace(/\[(\w+)\]/g, '.$1')
  // @zh 去除开头的点号
  // @en strip a leading dot
  path = path.replace(/^\./, '')
  return getNestedValue(obj, path.split('.'), fallback)
}

export type SelectItemKey<T = Record<string, any>> =
  // @zh 忽略
  // @en Ignored
  | boolean | null | undefined
  // @zh 按键查找，可以使用点符号访问嵌套对象
  // @en Lookup by key, can use dot notation for nested objects
  | string
  // @zh 按键嵌套查找，每个数组项是下一级的键
  // @en Nested lookup by key, each array item is a key in the next level
  | readonly (string | number)[]
  | ((item: T, fallback?: any) => any)

/**
 * @zh 从item中获取属性值。
 * @en Get property value from item.
 *
 * @export
 * @param {*} item 要获取属性值的项。
 * @param {SelectItemKey} property 要获取的属性。
 * @param {*} [fallback] 默认值（可选）。
 * @return {*}  {*} 返回属性值，如果未找到则返回默认值。
 *
 * @example
 * // 使用示例
 * const item = { id: 1, name: 'John', address: { city: 'New York' } };
 *
 * // 使用字符串路径获取属性值
 * getPropertyFromItem(item, 'name'); // 返回 'John'
 * getPropertyFromItem(item, 'address.city'); // 返回 'New York'
 *
 * // 使用数组路径获取属性值
 * getPropertyFromItem(item, ['address', 'city']); // 返回 'New York'
 *
 * // 使用函数获取属性值
 * const getCity = (item) => item.address.city;
 * getPropertyFromItem(item, getCity); // 返回 'New York'
 */
export function getPropertyFromItem(
  item: any,
  property: SelectItemKey,
  fallback?: any,
): any {
  if (property === true)
    return item === undefined ? fallback : item

  if (property == null || typeof property === 'boolean')
    return fallback

  if (item !== Object(item)) {
    if (typeof property !== 'function')
      return fallback

    const value = property(item, fallback)

    return typeof value === 'undefined' ? fallback : value
  }

  if (typeof property === 'string')
    return getObjectValueByPath(item, property, fallback)

  if (Array.isArray(property))
    return getNestedValue(item, property, fallback)

  if (typeof property !== 'function')
    return fallback

  const value = property(item, fallback)

  return typeof value === 'undefined' ? fallback : value
}

/**
 * @zh 创建一个包含指定长度的数字范围数组。
 * @en Create an array containing a numeric range of a specified length.
 *
 * @export
 * @param {number} length 数组的长度。
 * @param {number} [start] 数字范围的起始值，默认为 0。
 * @return {*}  {number[]} 返回包含数字范围的数组。
 */
export function createRange(length: number, start: number = 0): number[] {
  // @zh 使用 Array.from() 方法创建数组，并通过回调函数生成数字范围
  // @en Create an array using the Array.from() method, and generate a numeric range through a callback function.
  return Array.from({ length }, (_, k) => start + k)
}

/**
 * @zh 获取指定元素的 z-index 值。
 * @en Retrieve the z-index value of the specified element.
 *
 * @export
 * @param {(Element | null)} [el] el 要获取 z-index 值的元素。
 * @return {*}  {number} 返回指定元素的 z-index 值，如果未指定元素或指定的元素不是 Element 类型，则返回 0。
 *
 * @example
 * // 获取具有指定 ID 的元素的 z-index 值
 * const element = document.getElementById('myElement');
 * const zIndex = getZIndex(element);
 * console.log(zIndex); // 输出获取的 z-index 值
 */
export function getZIndex(el?: Element | null): number {
  // 如果未指定元素或元素不是 Element 类型，则返回 0
  if (!el || el.nodeType !== Node.ELEMENT_NODE)
    return 0

  // 获取元素的 z-index 值
  const index = +window.getComputedStyle(el).getPropertyValue('z-index')

  // 如果 z-index 值不存在或为 0，则递归获取父元素的 z-index 值
  if (!index)
    return getZIndex(el.parentNode as Element)
  return index
}

/**
 * @zh 将数字转换为带单位的字符串。
 * @en Convert a number to a string with units.
 *
 * @export
 * @param {number} str 要转换的数字或字符串。
 * @param {string} [unit] unit 单位（可选，默认为 'px'）。
 * @return {*}  {string} 返回带单位的字符串，如果输入为 null、undefined 或空字符串，则返回 undefined。
 *
 * @example
 * // 使用默认单位 'px' 将数字 20 转换为带单位的字符串
 * const result1 = convertToUnit(20);
 * console.log(result1); // 输出 '20px'
 *
 * // 使用单位 'rem' 将数字 30 转换为带单位的字符串
 * const result2 = convertToUnit(30, 'rem');
 * console.log(result2); // 输出 '30rem'
 */
export function convertToUnit(str: number, unit?: string): string
export function convertToUnit(str: string | number | null | undefined, unit?: string): string | undefined
export function convertToUnit(str: string | number | null | undefined, unit = 'px'): string | undefined {
  if (str == null || str === '')
    return undefined
  else if (Number.isNaN(+str!))
    return String(str)
  else if (!Number.isFinite(+str!))
    return undefined
  else
    return `${Number(str)}${unit}`
}

/**
 * @zh 检查给定的值是否为对象。
 *
 * @param obj   要检查的值。
 * @returns 如果给定的值是对象，则返回 true，否则返回 false。
 *
 * @example
 * // 检查一个对象
 * const obj = { key: 'value' };
 * const result1 = isObject(obj); // 返回 true
 *
 * // 检查一个数组
 * const arr = [1, 2, 3];
 * const result2 = isObject(arr); // 返回 false
 *
 * // 检查一个 null 值
 * const nullValue = null;
 * const result3 = isObject(nullValue); // 返回 false
 */
export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * @zh 返回指定的组件实例或 HTML 元素的引用。
 *
 * @export
 * @param {(ComponentPublicInstance<any> | HTMLElement)} [obj] 要获取引用的组件实例或 HTML 元素。
 * @return {*}  {(HTMLElement | undefined)} 返回组件实例的根 HTML 元素，
 * 如果参数是文本节点，则返回文本节点的下一个兄弟元素；
 * 如果参数是 HTML 元素，则直接返回该元素；
 * 如果参数为 undefined 或 null，则返回 undefined。
 *
 * @example
 * // 获取组件实例的根 HTML 元素
 * const instance = getCurrentInstance();
 * const rootElement1 = refElement(instance);
 *
 * // 获取指定 HTML 元素的引用
 * const element = document.getElementById('myElement');
 * const rootElement2 = refElement(element);
 *
 * // 参数为 undefined 或 null，返回 undefined
 * const rootElement3 = refElement(); // 返回 undefined
 */
export function refElement(obj?: ComponentPublicInstance<any> | HTMLElement): HTMLElement | undefined {
  if (obj && '$el' in obj) {
    const el = obj.$el as HTMLElement
    if (el?.nodeType === Node.TEXT_NODE) {
      // Multi-root component, use the first element
      return el.nextElementSibling as HTMLElement
    }
    return el
  }
  return obj as HTMLElement
}

/**
 * @zh KeyboardEvent.keyCode 别名
 * @en KeyboardEvent.keyCode aliases
 */
export const keyCodes = Object.freeze({
  enter: 13,
  tab: 9,
  delete: 46,
  esc: 27,
  space: 32,
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  end: 35,
  home: 36,
  del: 46,
  backspace: 8,
  insert: 45,
  pageup: 33,
  pagedown: 34,
  shift: 16,
})

/**
 * @zh 键盘事件的键值别名映射表。
 * @en Mapping table for keyboard event key values aliases.
 */
export const keyValues: Record<string, string> = Object.freeze({
  enter: 'Enter',
  tab: 'Tab',
  delete: 'Delete',
  esc: 'Escape',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  end: 'End',
  home: 'Home',
  del: 'Delete',
  backspace: 'Backspace',
  insert: 'Insert',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  shift: 'Shift',
})

/**
 * @zh 返回给定对象的所有键组成的数组。
 * @en Returns an array containing all keys of the given object.
 *
 * @export
 * @template O 对象类型
 * @param {O} o 要获取键的对象
 * @return {*} 给定对象的所有键组成的数组
 */
export function keys<O extends {}>(o: O): (keyof O)[] {
  return Object.keys(o) as (keyof O)[]
}

/**
 * @zh 检查给定的对象是否具有指定的键数组。
 * @en Checks if the given object has the specified array of keys.
 *
 * @export
 * @template T 键类型
 * @param {object} obj 要检查的对象
 * @param {T[]} key 指定的键数组
 * @return {*}  {obj is Record<T, unknown>} 如果对象具有指定的键数组，则返回 true，否则返回 false
 */
export function has<T extends string>(obj: object, key: T[]): obj is Record<T, unknown> {
  return key.every(k => Object.prototype.hasOwnProperty.call(obj, k))
}

/**
 * @zh 根据给定的对象类型和键集合创建一个可能为部分的新类型。
 * 如果给定的对象类型是 `Record<string, unknown>`，则返回部分的目标类型；否则返回完整的目标类型。
 * @en Creates a new type that may be partial based on the given object type and set of keys.
 * If the given object type is `Record<string, unknown>`, it returns a partial target type; otherwise, it returns a complete target type.
 *
 * @template T 给定对象的类型
 * @template U 提取的键的联合类型
 */
type MaybePick<
  T extends object,
  U extends Extract<keyof T, string>,
> = Record<string, unknown> extends T ? Partial<Pick<T, U>> : Pick<T, U>

/**
 * @zh 从给定对象中选择指定的键集合，并返回一个新对象。
 * 新对象可能为部分类型，取决于给定对象是否为 `Record<string, unknown>` 类型。
 * @en Selects the specified set of keys from the given object and returns a new object.
 * The new object may be partial depending on whether the given object is of type `Record<string, unknown>`.
 *
 * @export
 * @template T 给定对象的类型
 * @template U 要选择的键的联合类型
 * @param {T} obj 给定对象
 * @param {U[]} paths 要选择的键集合
 * @return {*}  {MaybePick<T, U>} 包含指定键的新对象
 */
export function pick<
  T extends object,
  U extends Extract<keyof T, string>,
>(obj: T, paths: U[]): MaybePick<T, U> {
  const found: any = {}

  const keys = new Set(Object.keys(obj))
  for (const path of paths) {
    if (keys.has(path))
      found[path] = obj[path]
  }

  return found
}

/**
 * @zh 从给定对象中选择指定的键集合，并返回一个包含两个部分的数组。
 * 第一个部分包含选择的键，第二个部分包含未选择的键。
 * @en Selects the specified set of keys from the given object and returns an array containing two partial objects.
 * The first part contains the selected keys, and the second part contains the unselected keys.
 *
 * @export
 * @template T 给定对象的类型
 * @template U 要选择的键的联合类型
 * @template E 要排除的键的联合类型
 * @param {T} obj 给定对象
 * @param {U[]} paths 要选择的键集合或用于匹配键的正则表达式
 * @param {E[]} [exclude] 要排除的键集合
 * @return {*}  {[yes: MaybePick<T, Exclude<U, E>>, no: Omit<T, Exclude<U, E>>]} 包含选择的键和未选择的键的数组
 */
export function pickWithRest<
  T extends object,
  U extends Extract<keyof T, string>,
  E extends Extract<keyof T, string>,
>(obj: T, paths: U[], exclude?: E[]): [yes: MaybePick<T, Exclude<U, E>>, no: Omit<T, Exclude<U, E>>]
// Array of keys or RegExp to test keys against
export function pickWithRest<
  T extends object,
  U extends Extract<keyof T, string>,
  E extends Extract<keyof T, string>,
>(obj: T, paths: (U | RegExp)[], exclude?: E[]): [yes: Partial<T>, no: Partial<T>]
export function pickWithRest<
  T extends object,
  U extends Extract<keyof T, string>,
  E extends Extract<keyof T, string>,
>(obj: T, paths: (U | RegExp)[], exclude?: E[]): [yes: Partial<T>, no: Partial<T>] {
  const found = Object.create(null)
  const rest = Object.create(null)

  for (const key in obj) {
    if (
      paths.some(path => path instanceof RegExp
        ? path.test(key)
        : path === key,
      ) && !exclude?.some(path => path === key)
    )
      found[key] = obj[key]
    else
      rest[key] = obj[key]
  }

  return [found, rest]
}

/**
 * @zh 从给定对象中排除指定的键集合，并返回一个新对象。
 * @en Excludes the specified set of keys from the given object and returns a new object.
 *
 * @export
 * @template T 给定对象的类型
 * @template U 要排除的键的联合类型
 * @param {T} obj 给定对象
 * @param {U[]} exclude 要排除的键集合
 * @return {*}  {Omit<T, U>} 不包含指定键的新对象
 */
export function omit<
  T extends object,
  U extends Extract<keyof T, string>,
>(obj: T, exclude: U[]): Omit<T, U> {
  const clone = { ...obj }

  exclude.forEach(prop => delete clone[prop])

  return clone
}

/**
 * @zh 从给定对象中仅包含指定的键集合，并返回一个新对象。
 * @en Includes only the specified set of keys from the given object and returns a new object.
 *
 * @export
 * @template T 给定对象的类型
 * @template U 要包含的键的联合类型
 * @param {T} obj 给定对象
 * @param {U[]} include 要包含的键集合
 * @return {*}  {Pick<T, U>} 包含指定键的新对象
 */
export function only<
  T extends object,
  U extends Extract<keyof T, string>,
>(obj: T, include: U[]): Pick<T, U> {
  const clone = {} as T

  include.forEach(prop => clone[prop] = obj[prop])

  return clone
}

/**
 * 正则表达式：匹配以'on'开头且后面不跟小写字母的字符串。
 */
const onRE = /^on[^a-z]/
/**
 * 检查给定的键是否以'on'开头且后面不跟小写字母。
 *
 * @param {string} key 要检查的键
 * @returns {boolean} 如果给定的键以'on'开头且后面不跟小写字母，则返回true；否则返回false。
 *
 * @example
 * console.log(isOn('onClick')) // 输出: true
 * console.log(isOn('onmouseover')) // 输出: false
 * console.log(isOn('click')) // 输出: false
 * console.log(isOn('hover')) // 输出: false
 */
export const isOn = (key: string): boolean => onRE.test(key)

/**
 * @zh 包含会冒泡的DOM事件的列表。
 * @en List of DOM events that bubble.
 */
const bubblingEvents = [
  'onAfterscriptexecute',
  'onAnimationcancel',
  'onAnimationend',
  'onAnimationiteration',
  'onAnimationstart',
  'onAuxclick',
  'onBeforeinput',
  'onBeforescriptexecute',
  'onChange',
  'onClick',
  'onCompositionend',
  'onCompositionstart',
  'onCompositionupdate',
  'onContextmenu',
  'onCopy',
  'onCut',
  'onDblclick',
  'onFocusin',
  'onFocusout',
  'onFullscreenchange',
  'onFullscreenerror',
  'onGesturechange',
  'onGestureend',
  'onGesturestart',
  'onGotpointercapture',
  'onInput',
  'onKeydown',
  'onKeypress',
  'onKeyup',
  'onLostpointercapture',
  'onMousedown',
  'onMousemove',
  'onMouseout',
  'onMouseover',
  'onMouseup',
  'onMousewheel',
  'onPaste',
  'onPointercancel',
  'onPointerdown',
  'onPointerenter',
  'onPointerleave',
  'onPointermove',
  'onPointerout',
  'onPointerover',
  'onPointerup',
  'onReset',
  'onSelect',
  'onSubmit',
  'onTouchcancel',
  'onTouchend',
  'onTouchmove',
  'onTouchstart',
  'onTransitioncancel',
  'onTransitionend',
  'onTransitionrun',
  'onTransitionstart',
  'onWheel',
]

/**
 * @zh 忽略组合事件的按键列表。
 * @en List of keys to ignore for composition events.
 */
const compositionIgnoreKeys = [
  'ArrowUp',
  'ArrowDown',
  'ArrowRight',
  'ArrowLeft',
  'Enter',
  'Escape',
  'Tab',
  ' ',
]

/**
 * @zh 检查按键事件是否为正在输入法输入并且需要忽略的按键。
 * @en Checks if a key event is a composing input and needs to be ignored.
 *
 * @export
 * @param {KeyboardEvent} e 键盘事件对象。
 * @return {*}  {boolean} 如果按键事件为正在组合输入且需要忽略的按键，则返回 true；否则返回 false。
 */
export function isComposingIgnoreKey(e: KeyboardEvent): boolean {
  return e.isComposing && compositionIgnoreKeys.includes(e.key)
}

/**
 * @zh 过滤应用于输入组件根元素的属性。其余属性应传递给内部的 <input> 元素。
 * @en Filter attributes that should be applied to
 * the root element of an input component. Remaining
 * attributes should be passed to the <input> element inside.
 *
 * @export
 * @param {Record<string, unknown>} attrs 要过滤的属性对象。
 * @return {*} 返回一个数组，包含过滤后应用于根元素的属性和应用于 <input> 元素的属性。
 */
export function filterInputAttrs(attrs: Record<string, unknown>): [rootAttrs: Partial<Record<string, unknown>>, inputAttrs: Partial<Record<string, unknown>>] {
  const [events, props] = pickWithRest(attrs, [onRE])
  const inputEvents = omit(events, bubblingEvents)
  const [rootAttrs, inputAttrs] = pickWithRest(props, ['class', 'style', 'id', /^data-/])
  Object.assign(rootAttrs, events)
  Object.assign(inputAttrs, inputEvents)
  return [rootAttrs, inputAttrs]
}

/**
 * @zh 返回集合 B 与集合 A 的差集，即集合 B 中存在但集合 A 中不存在的元素集合
 * @en Returns the set difference of B and A, i.e. the set of elements in B but not in A
 *
 * @export
 * @param {any[]} a 集合 A
 * @param {any[]} b 集合 B
 * @return {*}  {any[]} 差集，包含在 B 中但不在 A 中的元素数组
 *
 * @example
 * const arrayA = [1, 2, 3, 4, 5];
 * const arrayB = [3, 4, 5, 6, 7];
 * const difference = arrayDiff(arrayA, arrayB);
 * console.log(difference); // Output: [1, 2, 6, 7]
 */
export function arrayDiff(a: any[], b: any[]): any[] {
  const diff: any[] = []
  for (let i = 0; i < b.length; i++) {
    if (!a.includes(b[i]))
      diff.push(b[i])
  }

  return diff
}

/**
 * @zh 条件类型，用于检查类型 `T` 是否推断为 `any`。
 * 如果 `T` 是 `any`，则返回 `Y`，否则返回 `N`。
 * @en Conditional type that checks if the type `T` is inferred as `any`.
 * If `T` is `any`, it evaluates to `Y`, otherwise it evaluates to `N`.
 */
type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N

/**
 * @zh 将值包装在数组中。
 * 如果值为 null 或 undefined，则返回空数组。
 * 如果值是数组类型，则根据是否推断为 `any`，返回相应的类型。
 * 否则，将值放入一个数组中并返回。
 * @en  Wraps a value in an array.
 * Returns an empty array if the value is null or undefined.
 * If the value is already an array, returns the same array or a copy based on the type inference.
 * Otherwise, puts the value in an array and returns.
 *
 * @export
 * @template T 给定值的类型
 * @param {(T | null | undefined)} v 给定值
 * @return {*}  {T extends readonly any[] ? IfAny<T, T[], T>} 包装成数组返回
 */
export function wrapInArray<T>(
  v: T | null | undefined,
): T extends readonly any[]
    ? IfAny<T, T[], T>
    : NonNullable<T>[] {
  return v == null
    ? []
    : Array.isArray(v)
      ? v as any
      : [v]
}

/**
 * @zh 默认过滤器函数，用于在给定搜索字符串的情况下检查值是否匹配。
 * 如果值或搜索字符串为 null，则返回 false。
 * 如果值为布尔类型，则返回 false。
 * 否则，将值转换为字符串并进行大小写不敏感的搜索。
 * @en Default filter function to check if a value matches the given search string.
 * Returns false if the value or search string is null.
 * Returns false if the value is of type boolean.
 * Otherwise, converts the value to a string and performs a case-insensitive search.
 *
 * @export
 * @param {*} value 给定的值
 * @param {(string | null)} search 搜索字符串
 * @return {*}  {boolean} 如果值匹配搜索字符串，则返回 true；否则返回 false
 */
export function defaultFilter(value: any, search: string | null): boolean {
  return value != null
    && search != null
    && typeof value !== 'boolean'
    && value.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase())
}

/**
 * @zh 防抖函数，延迟执行传入的函数。
 * @en Debounce function to delay the execution of the provided function.
 *
 * @export
 * @param {Function} fn 要延迟执行的函数
 * @param {MaybeRef<number>} delay 延迟时间，可以是一个引用类型的数值
 * @return {*} 包含防抖逻辑的包装函数
 */
export function debounce(fn: Function, delay: MaybeRef<number>): {
  (...args: any[]): void
  clear: () => void
  immediate: Function
} {
  let timeoutId = 0 as any
  const wrap = (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), unref(delay))
  }
  wrap.clear = () => {
    clearTimeout(timeoutId)
  }
  wrap.immediate = fn
  return wrap
}

/**
 * @zh 对函数进行节流，使其在指定的时间间隔内最多执行一次。
 * @en Throttles a function so that it is only called at most once within the specified time limit.
 *
 * @export
 * @template T 函数类型
 * @param {T} fn 需要进行节流的函数
 * @param {number} limit 时间间隔，单位为毫秒
 * @return {*}  {(...args: Parameters<T>) => void | ReturnType<T>} 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void | ReturnType<T> {
  let throttling = false
  return (...args: Parameters<T>): void | ReturnType<T> => {
    if (!throttling) {
      throttling = true
      setTimeout(() => throttling = false, limit)
      return fn(...args)
    }
  }
}

/**
 * @zh 将一个数值限制在指定的最小值和最大值之间。
 * @en Clamps a number to be within the specified minimum and maximum values.
 *
 * @export
 * @param {number} value 需要限制的数值
 * @param {number} [min] 最小值，默认为 0
 * @param {number} [max] 最大值，默认为 1
 * @return {*}  {number} 限制后的数值
 */
export function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * @zh 获取数值的小数位数。
 * @en Gets the number of decimal places in a number.
 *
 * @export
 * @param {number} value 需要检查的小数值
 * @return {*}  {number} 小数位数
 */
export function getDecimals(value: number): number {
  const trimmedStr = value.toString().trim()
  return trimmedStr.includes('.')
    ? (trimmedStr.length - trimmedStr.indexOf('.') - 1)
    : 0
}

/**
 * @zh 用指定的字符填充字符串的右侧，直到达到指定的长度。
 * @en Pads the end of a string with a specified character until the string reaches the specified length.
 *
 * @export
 * @param {string} str 需要填充的字符串
 * @param {number} length 目标长度
 * @param {string} [char] 用于填充的字符，默认为 '0'
 * @return {*}  {string} 填充后的字符串
 */
export function padEnd(str: string, length: number, char: string = '0'): string {
  return str + char.repeat(Math.max(0, length - str.length))
}

/**
 * @zh 用指定的字符填充字符串的左侧，直到达到指定的长度。
 * @en Pads the start of a string with a specified character until the string reaches the specified length.
 *
 * @export
 * @param {string} str 需要填充的字符串
 * @param {number} length 目标长度
 * @param {string} [char] 用于填充的字符，默认为 '0'
 * @return {*}  {string} 填充后的字符串
 */
export function padStart(str: string, length: number, char: string = '0'): string {
  return char.repeat(Math.max(0, length - str.length)) + str
}

/**
 * @zh 将字符串按指定的大小分割成块。
 * @en Splits a string into chunks of the specified size.
 *
 * @export
 * @param {string} str 要分割的字符串
 * @param {number} [size] 每个块的大小，默认为 1
 * @return {*}  {string[]} 分割后的字符串数组
 */
export function chunk(str: string, size: number = 1): string[] {
  const chunked: string[] = []
  let index = 0
  while (index < str.length) {
    chunked.push(str.substr(index, size))
    index += size
  }
  return chunked
}

/**
 * @zh 将数组按指定的大小分割成块。
 * @en Splits an array into chunks of the specified size.
 *
 * @export
 * @param {any[]} array 要分割的数组
 * @param {number} [size] 每个块的大小，默认为 1
 * @return {*}  {any[][]} 分割后的数组块组成的数组
 */
export function chunkArray(array: any[], size: number = 1): any[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size))
}

/**
 * @zh 将字节数转换为更易读的文件大小字符串。
 * @en Converts a byte count into a human-readable file size string.
 *
 * @export
 * @param {number} bytes 文件大小的字节数
 * @param {(1000 | 1024)} [base] 用于计算文件大小的基数（1000 或 1024），默认为 1000
 * @return {*}  {string} 更易读的文件大小字符串
 */
export function humanReadableFileSize(bytes: number, base: 1000 | 1024 = 1000): string {
  if (bytes < base)
    return `${bytes} B`

  const prefix = base === 1024 ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G']
  let unit = -1
  while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
    bytes /= base
    ++unit
  }
  return `${bytes.toFixed(1)} ${prefix[unit]}B`
}

/**
 * @zh 深度合并两个对象。
 * @en Deeply merges two objects.
 *
 * @export
 * @param {Record<string, any>} [source] 源对象
 * @param {Record<string, any>} [target] 目标对象
 * @param {((a: unknown[], b: unknown[]) => unknown[])} [arrayFn] 数组合并函数
 * @return {*}  {Record<string, any>} 合并后的对象
 */
export function mergeDeep(
  source: Record<string, any> = {},
  target: Record<string, any> = {},
  arrayFn?: (a: unknown[], b: unknown[]) => unknown[],
): Record<string, any> {
  const out: Record<string, any> = {}

  for (const key in source)
    out[key] = source[key]

  for (const key in target) {
    const sourceProperty = source[key]
    const targetProperty = target[key]

    // Only continue deep merging if
    // both properties are objects
    if (
      isObject(sourceProperty)
      && isObject(targetProperty)
    ) {
      out[key] = mergeDeep(sourceProperty, targetProperty, arrayFn)

      continue
    }

    if (Array.isArray(sourceProperty) && Array.isArray(targetProperty) && arrayFn) {
      out[key] = arrayFn(sourceProperty, targetProperty)

      continue
    }

    out[key] = targetProperty
  }

  return out
}

/**
 * @zh 将包含片段的虚拟节点数组展平为一个虚拟节点数组。
 * @en Flattens an array of virtual nodes containing fragments into a single array of virtual nodes.
 *
 * @export
 * @param {VNode[]} nodes 包含片段的虚拟节点数组
 * @return {*}  {VNode[]} 展平后的虚拟节点数组
 */
export function flattenFragments(nodes: VNode[]): VNode[] {
  return nodes.map((node) => {
    if (node.type === Fragment)
      return flattenFragments(node.children as VNode[])
    else
      return node
  }).flat()
}

/**
 * @zh 将字符串转换为 kebab-case 格式。
 * @en Converts a string to kebab-case format.
 *
 * @export
 * @param {string} [str] 需要转换的字符串
 * @return {*}  {string} 转换后的 kebab-case 格式字符串
 */
export function toKebabCase(str = ''): string {
  if (toKebabCase.cache.has(str))
    return toKebabCase.cache.get(str)!
  const kebab = str
    .replace(/[^a-z]/gi, '-')
    .replace(/\B([A-Z])/g, '-$1')
    .toLowerCase()
  toKebabCase.cache.set(str, kebab)
  return kebab
}
/**
 * @zh 用于缓存转换结果的 Map 对象
 * @en Map object for caching conversion results
 */
toKebabCase.cache = new Map<string, string>()

/**
 * @zh 表示一个值，可以是普通值或 Vue 3 的 ref。
 * @en Represents a value that may be either a normal value or a Vue 3 ref.
 *
 * @export
 * @template T 值的类型
 */
export type MaybeRef<T> = T | Ref<T>

/**
 * @zh 在虚拟 DOM 树中查找所有提供指定注入键的组件实例。
 * @en Finds all component instances in the virtual DOM tree that provide a specified injection key.
 *
 * @export
 * @param {(InjectionKey<any> | symbol)} key The injection key to search for
 * @param {VNodeChild} [vnode] The virtual DOM node or array of nodes to search within
 * @return {*}  {ComponentInternalInstance[]} An array of component instances providing the injection key
 */
export function findChildrenWithProvide(
  key: InjectionKey<any> | symbol,
  vnode?: VNodeChild,
): ComponentInternalInstance[] {
  if (!vnode || typeof vnode !== 'object')
    return []

  if (Array.isArray(vnode)) {
    return vnode.map(child => findChildrenWithProvide(key, child)).flat(1)
  }
  else if (Array.isArray(vnode.children)) {
    return vnode.children.map(child => findChildrenWithProvide(key, child)).flat(1)
  }
  else if (vnode.component) {
    if (Object.getOwnPropertySymbols((vnode.component as any).provides).includes(key as symbol))
      return [vnode.component]
    else if (vnode.component.subTree)
      return findChildrenWithProvide(key, vnode.component.subTree).flat(1)
  }

  return []
}

/**
 * @en 表示一个循环缓冲区数据结构。
 * @zh Represents a circular buffer data structure.
 *
 * @export
 * @class CircularBuffer
 * @template T 元素类型
 */
export class CircularBuffer<T = never> {
  readonly #arr: Array<T> = []
  #pointer = 0

  constructor(public readonly size: number) {}

  push(val: T) {
    this.#arr[this.#pointer] = val
    this.#pointer = (this.#pointer + 1) % this.size
  }

  values(): T[] {
    return this.#arr.slice(this.#pointer).concat(this.#arr.slice(0, this.#pointer))
  }
}

/**
 * @zh 将联合类型转换为交叉类型。
 * @en Converts a union type to an intersection type.
 *
 * @export
 * @type UnionToIntersection
 * @template U 需要转换的联合类型
 */
export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/**
 * @zh 获取事件（鼠标或触摸）的客户端坐标。
 * @en Gets the client coordinates of an event (mouse or touch).
 *
 * @export
 * @param {(MouseEvent | TouchEvent)} e 鼠标或触摸事件
 * @return {*}  {{ clientX: number; clientY: number }} 包函客户端坐标的对象
 */
export function getEventCoordinates(e: MouseEvent | TouchEvent): {
  clientX: number
  clientY: number
} {
  if ('touches' in e)
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }

  return { clientX: e.clientX, clientY: e.clientY }
}

// Only allow a single return type
type NotAUnion<T> = [T] extends [infer U] ? _NotAUnion<U, U> : never
type _NotAUnion<T, U> = U extends any ? [T] extends [U] ? unknown : never : never

/**
 * Convert a computed ref to a record of refs.
 * The getter function must always return an object with the same keys.
 */
export function destructComputed<T extends object>(getter: ComputedGetter<T & NotAUnion<T>>): ToRefs<T>
export function destructComputed<T extends object>(getter: ComputedGetter<T>) {
  const refs = reactive({}) as T
  const base = computed(getter)
  watchEffect(() => {
    for (const key in base.value)
      refs[key] = base.value[key]
  }, { flush: 'sync' })
  return toRefs(refs)
}

/** Array.includes but value can be any type */
export function includes(arr: readonly any[], val: any) {
  return arr.includes(val)
}

export function eventName(propName: string) {
  return propName[2].toLowerCase() + propName.slice(3)
}

export type EventProp<T extends any[] = any[], F = (...args: T) => void> = F
export const EventProp = <T extends any[] = any[]>() => [Function, Array] as PropType<EventProp<T>>

export function hasEvent(props: Record<string, any>, name: string) {
  name = `on${capitalize(name)}`
  return !!(props[name] || props[`${name}Once`] || props[`${name}Capture`] || props[`${name}OnceCapture`] || props[`${name}CaptureOnce`])
}

export function callEvent<T extends any[]>(handler: EventProp<T> | undefined, ...args: T) {
  if (Array.isArray(handler)) {
    for (const h of handler)
      h(...args)
  }
  else if (typeof handler === 'function') {
    handler(...args)
  }
}

export function focusableChildren(el: Element, filterByTabIndex = true) {
  const targets = ['button', '[href]', 'input:not([type="hidden"])', 'select', 'textarea', '[tabindex]']
    .map(s => `${s}${filterByTabIndex ? ':not([tabindex="-1"])' : ''}:not([disabled])`)
    .join(', ')
  return [...el.querySelectorAll(targets)] as HTMLElement[]
}

export function getNextElement(elements: HTMLElement[], location?: 'next' | 'prev', condition?: (el: HTMLElement) => boolean) {
  let _el
  let idx = elements.indexOf(document.activeElement as HTMLElement)
  const inc = location === 'next' ? 1 : -1
  do {
    idx += inc
    _el = elements[idx]
  } while ((!_el || _el.offsetParent == null || !(condition?.(_el) ?? true)) && idx < elements.length && idx >= 0)
  return _el
}

export function focusChild(el: Element, location?: 'next' | 'prev' | 'first' | 'last' | number) {
  const focusable = focusableChildren(el)

  if (!location) {
    if (el === document.activeElement || !el.contains(document.activeElement))
      focusable[0]?.focus()
  }
  else if (location === 'first') {
    focusable[0]?.focus()
  }
  else if (location === 'last') {
    focusable.at(-1)?.focus()
  }
  else if (typeof location === 'number') {
    focusable[location]?.focus()
  }
  else {
    const _el = getNextElement(focusable, location)
    if (_el)
      _el.focus()
    else focusChild(el, location === 'next' ? 'first' : 'last')
  }
}

export function isEmpty(val: any): boolean {
  return val === null || val === undefined || (typeof val === 'string' && val.trim() === '')
}

export function noop() {}

/** Returns null if the selector is not supported or we can't check */
export function matchesSelector(el: Element | undefined, selector: string): boolean | null {
  const supportsSelector = IN_BROWSER
    && typeof CSS !== 'undefined'
    && typeof CSS.supports !== 'undefined'
    && CSS.supports(`selector(${selector})`)

  if (!supportsSelector)
    return null

  try {
    return !!el && el.matches(selector)
  }
  catch (err) {
    return null
  }
}

export function ensureValidVNode(vnodes: VNodeArrayChildren): VNodeArrayChildren | null {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true
    if (child.type === Comment)
      return false
    return child.type !== Fragment
      || ensureValidVNode(child.children as VNodeArrayChildren)
  })
    ? vnodes
    : null
}

export function defer(timeout: number, cb: () => void) {
  if (!IN_BROWSER || timeout === 0) {
    cb()

    return () => {}
  }

  const timeoutId = window.setTimeout(cb, timeout)

  return () => window.clearTimeout(timeoutId)
}

export function eagerComputed<T>(fn: () => T, options?: WatchOptions): Readonly<Ref<T>> {
  const result = shallowRef()

  watchEffect(() => {
    result.value = fn()
  }, {
    flush: 'sync',
    ...options,
  })

  return readonly(result)
}

export function isClickInsideElement(event: MouseEvent, targetDiv: HTMLElement) {
  const mouseX = event.clientX
  const mouseY = event.clientY

  const divRect = targetDiv.getBoundingClientRect()
  const divLeft = divRect.left
  const divTop = divRect.top
  const divRight = divRect.right
  const divBottom = divRect.bottom

  return mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom
}

export interface TemplateRef {
  (target: Element | ComponentPublicInstance | null): void
  value: HTMLElement | ComponentPublicInstance | null | undefined
  readonly el: HTMLElement | undefined
}
export function templateRef() {
  const el = shallowRef<HTMLElement | ComponentPublicInstance | null>()
  const fn = (target: HTMLElement | ComponentPublicInstance | null) => {
    el.value = target
  }
  Object.defineProperty(fn, 'value', {
    enumerable: true,
    get: () => el.value,
    set: val => el.value = val,
  })
  Object.defineProperty(fn, 'el', {
    enumerable: true,
    get: () => refElement(el.value),
  })

  return fn as TemplateRef
}
