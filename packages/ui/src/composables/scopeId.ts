import { getCurrentInstance } from '@/util'

/**
 * @zh 获取当前组件的作用域 ID。
 *
 * @export
 * @return {*}  { { scopeId: { [key: string]: string } | undefined } } 返回一个包含作用域 ID 的对象。
 */
export function useScopeId() {
  const vm = getCurrentInstance('useScopeId')

  const scopeId = vm!.vnode.scopeId

  return { scopeId: scopeId ? { [scopeId]: '' } : undefined }
}
