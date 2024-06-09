import { isOn } from '@/util/helpers'

type EventHandler = (event: Event) => any

/**
 * @zh 根据给定的属性对象，筛选出以特定后缀结尾的事件处理函数，并返回一个新的属性对象，键名包含原键名去掉后缀，值为对应的事件处理函数。
 * @en Filters event handler functions with a specific suffix from the given attributes object, and returns a new object where keys include original keys without the suffix and values are corresponding event handler functions.
 *
 * @param {Record<string, any>} attrs 给定的属性对象
 * @param {T} suffix 后缀
 * @param {EventHandler} getData 获取数据的事件处理函数
 * @return {*}  {Record<`${string}${T}`, EventHandler>} 包含筛选后事件处理函数的新对象
 */
export function getPrefixedEventHandlers<T extends `:${string}`>(
  attrs: Record<string, any>,
  suffix: T,
  getData: EventHandler,
): Record<`${string}${T}`, EventHandler> {
  return Object.keys(attrs)
    .filter(key => isOn(key) && key.endsWith(suffix))
    .reduce((acc: any, key) => {
      acc[key.slice(0, -suffix.length)] = (event: Event) => attrs[key](event, getData(event))
      return acc
    }, {} as Record<`${string}${T}`, EventHandler>)
}
