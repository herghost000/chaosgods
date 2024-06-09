import { computed, inject, onBeforeUnmount, onMounted, onUpdated, provide, reactive, toRef, unref, watch } from 'vue'
import type { ComponentInternalInstance, ComputedRef, ExtractPropTypes, InjectionKey, PropType, Ref, UnwrapRef } from 'vue'
import { useProxiedModel } from './proxiedModel'
import { consoleWarn, deepEqual, findChildrenWithProvide, getCurrentInstance, getUid, propsFactory, wrapInArray } from '@/util'
import type { EventProp } from '@/util'

/**
 * @zh 表示分组item的接口。
 *
 * @interface
 * @property {number} id 分组item的唯一标识符。
 * @property {Ref<unknown>} value 分组item的值。
 * @property {Ref<boolean | undefined>} disabled 表示分组item是否被禁用。
 * @property {boolean} [useIndexAsValue] 是否使用分组item的索引作为值。
 */
export interface GroupItem {
  id: number
  value: Ref<unknown>
  disabled: Ref<boolean | undefined>
  useIndexAsValue?: boolean
}

/**
 * @zh 表示分组组件的 props 接口。
 *
 * @interface
 * @property {boolean} disabled 是否禁用整个分组组件。
 * @property {unknown} modelValue 分组组件的模型值。
 * @property {boolean} [multiple] 是否支持多选，默认为单选。
 * @property {boolean | 'force' | undefined} [mandatory] 是否强制选择至少一个选项。
 * @property {number | undefined} [max] 允许选择的最大数量。
 * @property {string | undefined} [selectedClass] 选中项的 CSS 类名。
 * @property {EventProp<[unknown]> | undefined} onUpdate:modelValue 模型值更新事件的回调函数。
 */
export interface GroupProps {
  'disabled': boolean
  'modelValue': unknown
  'multiple'?: boolean
  'mandatory'?: boolean | 'force' | undefined
  'max'?: number | undefined
  'selectedClass': string | undefined
  'onUpdate:modelValue': EventProp<[unknown]> | undefined
}

/**
 * @zh 表示分组组件提供的上下文接口。
 *
 * @interface
 * @property {(item: GroupItem, cmp: ComponentInternalInstance) => void} register 注册分组item到分组组件。
 * @property {(id: number) => void} unregister 从分组组件中注销指定 id 的分组项。
 * @property {(id: number, value: boolean) => void} select 选择或取消选择指定 id 的分组项。
 * @property {Ref<Readonly<number[]>>} selected 当前选中的分组item id 列表的响应式引用。
 * @property {(id: number) => boolean} isSelected 检查指定 id 的分组item是否被选中。
 * @property {() => void} prev 切换到上一个分组item。
 * @property {() => void} next 切换到下一个分组item。
 * @property {Ref<string | undefined>} selectedClass 当前选中项的 CSS 类名的响应式引用。
 * @property {ComputedRef<GroupItem[]>} items 分组组件的所有分组item的计算属性。
 * @property {Ref<boolean | undefined>} disabled 分组组件是否被禁用的响应式引用。
 * @property {(value: unknown) => number} getItemIndex 获取指定值的分组item的索引。
 */
export interface GroupProvide {
  register: (item: GroupItem, cmp: ComponentInternalInstance) => void
  unregister: (id: number) => void
  select: (id: number, value: boolean) => void
  selected: Ref<Readonly<number[]>>
  isSelected: (id: number) => boolean
  prev: () => void
  next: () => void
  selectedClass: Ref<string | undefined>
  items: ComputedRef<{
    id: number
    value: unknown
    disabled: boolean | undefined
  }[]>
  disabled: Ref<boolean | undefined>
  getItemIndex: (value: unknown) => number
}

/**
 * @zh 表示分组项提供的上下文接口。
 *
 * @interface
 * @property {number} id 分组item的唯一标识符。
 * @property {Ref<boolean>} isSelected 分组item是否被选中的响应式引用。
 * @property {Ref<boolean>} isFirst 分组item是否为第一个的响应式引用。
 * @property {Ref<boolean>} isLast 分组item是否为最后一个的响应式引用。
 * @property {() => void} toggle 切换分组item的选中状态。
 * @property {(value: boolean) => void} select 选择或取消选择分组item。
 * @property {Ref<(string | undefined)[] | false>} selectedClass 分组item的 CSS 类名的响应式引用。
 * @property {Ref<unknown>} value 分组item的值的响应式引用。
 * @property {Ref<boolean | undefined>} disabled 分组item是否被禁用的响应式引用。
 * @property {GroupProvide} group 分组item所属的分组组件的上下文。
 */
export interface GroupItemProvide {
  id: number
  isSelected: Ref<boolean>
  isFirst: Ref<boolean>
  isLast: Ref<boolean>
  toggle: () => void
  select: (value: boolean) => void
  selectedClass: Ref<(string | undefined)[] | false>
  value: Ref<unknown>
  disabled: Ref<boolean | undefined>
  group: GroupProvide
}

export const makeGroupProps = propsFactory({
  modelValue: {
    type: null,
    default: undefined,
  },
  multiple: Boolean,
  mandatory: [Boolean, String] as PropType<boolean | 'force'>,
  max: Number,
  selectedClass: String,
  disabled: Boolean,
}, 'group')

export const makeGroupItemProps = propsFactory({
  value: null,
  disabled: Boolean,
  selectedClass: String,
}, 'group-item')

/**
 * @zh 表示分组item组件的 props 接口。
 *
 * @interface
 * @extends {ExtractPropTypes<ReturnType<typeof makeGroupItemProps>>}
 * @property {EventProp<[{ value: boolean }] | undefined>} onGroup:selected 分组项选中状态变化事件的回调函数。
 */
export interface GroupItemProps extends ExtractPropTypes<ReturnType<typeof makeGroupItemProps>> {
  'onGroup:selected': EventProp<[{ value: boolean }]> | undefined
}

/**
 * 用于管理分组item的组合函数。
 *
 * @param {GroupItemProps} props 分组item的 props 对象。
 * @param {InjectionKey<GroupProvide>} injectKey 分组item所属分组组件的注入键。
 * @param {boolean} [required] 是否必须存在分组组件的注入。
 * @returns {GroupItemProvide | null} 分组item提供的上下文对象，如果未找到分组组件的注入且不是必需的，则返回 null。
 */
export function useGroupItem(
  props: GroupItemProps,
  injectKey: InjectionKey<GroupProvide>,
  required?: true,
): GroupItemProvide
export function useGroupItem(
  props: GroupItemProps,
  injectKey: InjectionKey<GroupProvide>,
  required: false,
): GroupItemProvide | null
export function useGroupItem(
  props: GroupItemProps,
  injectKey: InjectionKey<GroupProvide>,
  required = true,
): GroupItemProvide | null {
  const vm = getCurrentInstance('useGroupItem')

  const id = getUid()

  provide(Symbol.for(`${injectKey.description}:id`), id)

  const group = inject(injectKey, null)

  if (!group) {
    if (!required)
      return group

    throw new Error(`[Chaos] Could not find useGroup injection with symbol ${injectKey.description}`)
  }

  const value = toRef(props, 'value')
  const disabled = computed(() => !!(group.disabled.value || props.disabled))

  group.register({
    id,
    value,
    disabled,
  }, vm)

  onBeforeUnmount(() => {
    group.unregister(id)
  })

  const isSelected = computed(() => {
    return group.isSelected(id)
  })
  const isFirst = computed(() => {
    return group.items.value[0].id === id
  })
  const isLast = computed(() => {
    return group.items.value[group.items.value.length - 1].id === id
  })

  const selectedClass = computed(() => isSelected.value && [group.selectedClass.value, props.selectedClass])

  watch(isSelected, (value) => {
    vm.emit('group:selected', { value })
  }, { flush: 'sync' })

  return {
    id,
    isSelected,
    isFirst,
    isLast,
    toggle: () => group.select(id, !isSelected.value),
    select: (value: boolean) => group.select(id, value),
    selectedClass,
    value,
    disabled,
    group,
  }
}

/**
 * 用于管理分组组件的组合函数。
 *
 * @param {GroupProps} props 分组组件的 props 对象。
 * @param {InjectionKey<GroupProvide>} injectKey 分组组件的注入键。
 * @returns {GroupProvide} 分组组件提供的上下文对象。
 */
export function useGroup(
  props: GroupProps,
  injectKey: InjectionKey<GroupProvide>,
): GroupProvide {
  let isUnmounted = false
  const items = reactive<GroupItem[]>([])
  const selected = useProxiedModel(
    props,
    'modelValue',
    [],
    (v) => {
      if (v == null)
        return []

      return getIds(items, wrapInArray(v))
    },
    (v) => {
      const arr = getValues(items, v)

      return props.multiple ? arr : arr[0]
    },
  )

  const groupVm = getCurrentInstance('useGroup')

  function register(item: GroupItem, vm: ComponentInternalInstance) {
    // Is there a better way to fix this typing?
    const unwrapped = item as unknown as UnwrapRef<GroupItem>

    const key = Symbol.for(`${injectKey.description}:id`)
    const children = findChildrenWithProvide(key, groupVm?.vnode)
    const index = children.indexOf(vm)

    if (unref(unwrapped.value) == null) {
      unwrapped.value = index
      unwrapped.useIndexAsValue = true
    }

    if (index > -1)
      items.splice(index, 0, unwrapped)
    else
      items.push(unwrapped)
  }

  function unregister(id: number) {
    if (isUnmounted)
      return

    // TODO: re-evaluate this line's importance in the future
    // should we only modify the model if mandatory is set.
    // selected.value = selected.value.filter(v => v !== id)

    forceMandatoryValue()

    const index = items.findIndex(item => item.id === id)
    items.splice(index, 1)
  }

  // If mandatory and nothing is selected, then select first non-disabled item
  function forceMandatoryValue() {
    const item = items.find(item => !item.disabled)
    if (item && props.mandatory === 'force' && !selected.value.length)
      selected.value = [item.id]
  }

  onMounted(() => {
    forceMandatoryValue()
  })

  onBeforeUnmount(() => {
    isUnmounted = true
  })

  onUpdated(() => {
    // #19655 update the items that use the index as the value.
    for (let i = 0; i < items.length; i++) {
      if (items[i].useIndexAsValue)
        items[i].value = i
    }
  })

  function select(id: number, value?: boolean) {
    const item = items.find(item => item.id === id)
    if (value && item?.disabled)
      return

    if (props.multiple) {
      const internalValue = selected.value.slice()
      const index = internalValue.findIndex(v => v === id)
      const isSelected = ~index
      value = value ?? !isSelected

      // We can't remove value if group is
      // mandatory, value already exists,
      // and it is the only value
      if (
        isSelected
        && props.mandatory
        && internalValue.length <= 1
      ) return

      // We can't add value if it would
      // cause max limit to be exceeded
      if (
        !isSelected
        && props.max != null
        && internalValue.length + 1 > props.max
      ) return

      if (index < 0 && value)
        internalValue.push(id)
      else if (index >= 0 && !value)
        internalValue.splice(index, 1)

      selected.value = internalValue
    }
    else {
      const isSelected = selected.value.includes(id)
      if (props.mandatory && isSelected)
        return

      selected.value = (value ?? !isSelected) ? [id] : []
    }
  }

  function step(offset: number) {
    // getting an offset from selected value obviously won't work with multiple values
    if (props.multiple)
      consoleWarn('This method is not supported when using "multiple" prop')

    if (!selected.value.length) {
      const item = items.find(item => !item.disabled)
      item && (selected.value = [item.id])
    }
    else {
      const currentId = selected.value[0]
      const currentIndex = items.findIndex(i => i.id === currentId)

      let newIndex = (currentIndex + offset) % items.length
      let newItem = items[newIndex]

      while (newItem.disabled && newIndex !== currentIndex) {
        newIndex = (newIndex + offset) % items.length
        newItem = items[newIndex]
      }

      if (newItem.disabled)
        return

      selected.value = [items[newIndex].id]
    }
  }

  const state: GroupProvide = {
    register,
    unregister,
    selected,
    select,
    disabled: toRef(props, 'disabled'),
    prev: () => step(items.length - 1),
    next: () => step(1),
    isSelected: (id: number) => selected.value.includes(id),
    selectedClass: computed(() => props.selectedClass),
    items: computed(() => items),
    getItemIndex: (value: unknown) => getItemIndex(items, value),
  }

  provide(injectKey, state)

  return state
}

/**
 * 根据值在分组item数组中查找对应的item的索引。
 *
 * @param {UnwrapRef<GroupItem[]>} items 分组item数组。
 * @param {unknown} value 要查找的值。
 * @returns {number} 找到的值在分组item数组中的索引，如果未找到则返回 -1。
 */
function getItemIndex(items: UnwrapRef<GroupItem[]>, value: unknown): number {
  const ids = getIds(items, [value])

  if (!ids.length)
    return -1

  return items.findIndex(item => item.id === ids[0])
}

/**
 * 根据模型值在分组item数组中查找对应项的 ID。
 *
 * @param {UnwrapRef<GroupItem[]>} items 分组item数组。
 * @param {any[]} modelValue 模型值数组。
 * @returns {number[]} 找到的模型值对应的分组item的 ID 数组。
 */
function getIds(items: UnwrapRef<GroupItem[]>, modelValue: any[]): number[] {
  const ids: number[] = []

  modelValue.forEach((value) => {
    const item = items.find(item => deepEqual(value, item.value))
    const itemByIndex = items[value]

    if (item?.value != null)
      ids.push(item.id)
    else if (itemByIndex != null)
      ids.push(itemByIndex.id)
  })

  return ids
}

/**
 * 根据分组item的 ID 在分组item数组中查找对应item的值。
 *
 * @param {UnwrapRef<GroupItem[]>} items 分组项数组。
 * @param {any[]} ids 分组item的 ID 数组。
 * @returns {unknown[]} 找到的分组item的值数组。
 */
function getValues(items: UnwrapRef<GroupItem[]>, ids: any[]): unknown[] {
  const values: unknown[] = []

  ids.forEach((id) => {
    const itemIndex = items.findIndex(item => item.id === id)
    if (~itemIndex) {
      const item = items[itemIndex]
      values.push(item.value != null ? item.value : itemIndex)
    }
  })

  return values
}
