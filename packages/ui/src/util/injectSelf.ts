import type { ComponentInternalInstance, InjectionKey } from 'vue'
import { getCurrentInstance } from '@/util/getCurrentInstance'

export function injectSelf<T>(key: InjectionKey<T> | string, vm?: ComponentInternalInstance): T | undefined
export function injectSelf(key: InjectionKey<any> | string, vm = getCurrentInstance('injectSelf')) {
  const { provides } = vm.appContext

  if (provides && (key as string | symbol) in provides)
    return provides[key as string]

  return undefined
}
