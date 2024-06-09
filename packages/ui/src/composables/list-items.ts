import { computed } from 'vue'
import type { PropType } from 'vue'
import { deepEqual, getPropertyFromItem, omit, propsFactory } from '@/util'
import type { InternalItem } from '@/composables/filter'
import type { SelectItemKey } from '@/util'

/**
 * @zh 列表item接口，用于表示列表中的每一项数据。
 *
 * @template T 列表item值的类型，默认为 any 类型。
 * @property {string} title 列表item的标题。
 * @property {object} props 列表item的属性对象，包含 title 和 value 属性。
 * @property {string} props.title 列表item的标题，与 title 属性相同。
 * @property {any} props.value 列表item的值。
 * @property {ListItem<T>[]} [children] 子项数组，用于表示列表item的子item列表。
 */
export interface ListItem<T = any> extends InternalItem<T> {
  title: string
  props: {
    [key: string]: any
    title: string
    value: any
  }
  children?: ListItem<T>[]
}

/**
 * @zh 列表item属性接口，用于表示列表item的属性配置。
 *
 * @property {any[]} items 列表item数组。
 * @property {SelectItemKey} itemTitle 列表item标题的键。
 * @property {SelectItemKey} itemValue 列表item值的键。
 * @property {SelectItemKey} itemChildren 列表项子项的键。
 * @property {SelectItemKey} itemProps 列表item属性的键。
 * @property {boolean} returnObject 是否返回对象。
 * @property {typeof deepEqual} valueComparator 值比较器函数。
 */
export interface ItemProps {
  items: any[]
  itemTitle: SelectItemKey
  itemValue: SelectItemKey
  itemChildren: SelectItemKey
  itemProps: SelectItemKey
  returnObject: boolean
  valueComparator: typeof deepEqual
}

// Composables
export const makeItemsProps = propsFactory({
  items: {
    type: Array as PropType<ItemProps['items']>,
    default: () => ([]),
  },
  itemTitle: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'title',
  },
  itemValue: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'value',
  },
  itemChildren: {
    type: [Boolean, String, Array, Function] as PropType<SelectItemKey>,
    default: 'children',
  },
  itemProps: {
    type: [Boolean, String, Array, Function] as PropType<SelectItemKey>,
    default: 'props',
  },
  returnObject: Boolean,
  valueComparator: {
    type: Function as PropType<typeof deepEqual>,
    default: deepEqual,
  },
}, 'list-items')

/**
 * @zh 将单个item转换为列表item。
 *
 * @param {Omit<ItemProps, 'items'>} props 列表item属性配置。
 * @param {any} item 单个item。
 * @returns {ListItem} 转换后的列表item。
 * @example
 * const props = {
 *   itemTitle: 'name',
 *   itemValue: 'id',
 *   itemChildren: 'children',
 *   itemProps: true,
 *   returnObject: false,
 *   valueComparator: deepEqual,
 * };
 *
 * const item = {
 *   name: 'Parent',
 *   id: 1,
 *   children: [
 *     { name: 'Child 1', id: 2 },
 *     { name: 'Child 2', id: 3 },
 *   ]
 * };
 *
 * const transformedItem = transformItem(props, item);
 * // Output:
 * // {
 * //   title: 'Parent',
 * //   value: 1,
 * //   props: { name: 'Parent', id: 1 },
 * //   children: [
 * //     { title: 'Child 1', value: 2, props: { name: 'Child 1', id: 2 }, raw: { name: 'Child 1', id: 2 } },
 * //     { title: 'Child 2', value: 3, props: { name: 'Child 2', id: 3 }, raw: { name: 'Child 2', id: 3 } }
 * //   ],
 * //   raw: { name: 'Parent', id: 1, children: [...] }
 * // }
 */
export function transformItem(props: Omit<ItemProps, 'items'>, item: any): ListItem {
  const title = getPropertyFromItem(item, props.itemTitle, item)
  const value = getPropertyFromItem(item, props.itemValue, title)
  const children = getPropertyFromItem(item, props.itemChildren)
  const itemProps = props.itemProps === true
    ? typeof item === 'object' && item != null && !Array.isArray(item)
      ? 'children' in item
        ? omit(item, ['children'])
        : item
      : undefined
    : getPropertyFromItem(item, props.itemProps)

  const _props = {
    title,
    value,
    ...itemProps,
  }

  return {
    title: String(_props.title ?? ''),
    value: _props.value,
    props: _props,
    children: Array.isArray(children) ? transformItems(props, children) : undefined,
    raw: item,
  }
}

export function transformItems(props: Omit<ItemProps, 'items'>, items: ItemProps['items']) {
  const array: ListItem[] = []

  for (const item of items)
    array.push(transformItem(props, item))

  return array
}

export function useItems(props: ItemProps) {
  const items = computed(() => transformItems(props, props.items))
  const hasNullItem = computed(() => items.value.some(item => item.value === null))

  function transformIn(value: any[]): ListItem[] {
    if (!hasNullItem.value) {
      // When the model value is null, return an InternalItem
      // based on null only if null is one of the items
      value = value.filter(v => v !== null)
    }

    return value.map((v) => {
      if (props.returnObject && typeof v === 'string') {
        // String model value means value is a custom input value from combobox
        // Don't look up existing items if the model value is a string
        return transformItem(props, v)
      }
      return items.value.find(item => props.valueComparator(v, item.value)) || transformItem(props, v)
    })
  }

  function transformOut(value: ListItem[]): any[] {
    return props.returnObject
      ? value.map(({ raw }) => raw)
      : value.map(({ value }) => value)
  }

  return { items, transformIn, transformOut }
}
