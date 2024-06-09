import { computed, ref, toRaw, watch } from 'vue'
import type { Ref } from 'vue'
import { useToggleScope } from '@/composables/toggleScope'

import type { EventProp } from '@/util'
import { getCurrentInstance, toKebabCase } from '@/util'

type InnerVal<T> = T extends any[] ? Readonly<T> : T
/**
 * @zh 提供一个实用函数，用于管理组件的模型，特别是在受控（父组件属性与onUpdate:属性同时存在）和非受控情况下。
 * @en Provides a utility for managing a component's model, particularly in controlled and uncontrolled scenarios.
 *
 * @param {object} props 组件的 props 对象。
 * @param {string} prop 表示模型的 prop 的名称。
 * @param {any} [defaultValue] 模型的默认值。
 * @param {(value?: any) => any} [transformIn] 对内部值进行转换
 * @param {(value: any) => any} [transformOut] 对外部值进行转换。
 * @returns {Ref} 包含模型值和管理函数的响应式引用。
 * @example
 * // 在组件的设置中使用
 * import { useProxiedModel } from '@/util';
 *
 * setup(props) {
 *   const model = useProxiedModel(props, 'modelValue');
 *
 *   // 访问模型值
 *   const value = model.value;
 *
 *   // 修改模型值
 *   model.value = newValue;
 *
 *   return { model };
 * }
 */
export function useProxiedModel<
  Props extends object & { [key in Prop as `onUpdate:${Prop}`]: EventProp | undefined },
  Prop extends Extract<keyof Props, string>,
  Inner = Props[Prop],
>(
  props: Props,
  prop: Prop,
  defaultValue?: Props[Prop],
  transformIn: (value?: Props[Prop]) => Inner = (v?: Props[Prop]) => v as Inner,
  transformOut: (value: Inner) => Props[Prop] = (v: Inner) => v as Props[Prop],
): Ref<InnerVal<Inner>> & {
  readonly externalValue: Props[Prop]
} {
  const vm = getCurrentInstance('useProxiedModel')
  const internal = ref(props[prop] !== undefined ? props[prop] : defaultValue) as Ref<Props[Prop]>
  const kebabProp = toKebabCase(prop)

  // @zh 检测是否横线命名
  const checkKebab = kebabProp !== prop

  const isControlled = checkKebab
    ? computed(() => {
      void props[prop]
      return !!(
        (Object.hasOwnProperty.call(vm.vnode.props, prop)
        || Object.hasOwnProperty.call(vm.vnode.props, kebabProp))
        && (Object.hasOwnProperty.call(vm.vnode.props, `onUpdate:${prop}`)
        || Object.hasOwnProperty.call(vm.vnode.props, `onUpdate:${kebabProp}`))
      )
    })
    : computed(() => {
      void props[prop]
      return !!(Object.hasOwnProperty.call(vm.vnode.props, prop)
        && Object.hasOwnProperty.call(vm.vnode.props, `onUpdate:${prop}`))
    })

  useToggleScope(() => !isControlled.value, () => {
    watch(() => props[prop], (val) => {
      internal.value = val
    })
  })

  const model = computed({
    get() {
      const externalValue = props[prop]
      return transformIn(isControlled.value ? externalValue : internal.value)
    },
    set(internalValue) {
      const newValue = transformOut(internalValue)
      const value = toRaw(isControlled.value ? props[prop] : internal.value)
      // @zh 无变化直接返回
      if (value === newValue || transformIn(value) === internalValue)
        return

      internal.value = newValue
      vm?.emit(`update:${prop}`, newValue)
    },
  }) as any as Ref<InnerVal<Inner>> & { readonly externalValue: Props[Prop] }

  Object.defineProperty(model, 'externalValue', {
    get: () => isControlled.value ? props[prop] : internal.value,
  })

  return model
}
