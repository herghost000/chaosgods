import type { VNode } from 'vue'
import { getCurrentInstance } from './getCurrentInstance'

export function useRender(render: () => VNode): void {
  const vm = getCurrentInstance('useRender') as any
  vm.render = render
}
