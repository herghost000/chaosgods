import { effectScope, onScopeDispose, watch } from 'vue'
import type { EffectScope, WatchSource } from 'vue'

/**
 * @zh 根据源变量的布尔值来动态创建和销毁一个 effect 作用域。
 * @en Dynamically create and destroy an effect scope based on the boolean value of the source variable.
 *
 * @param {WatchSource<boolean>} source 监视源变量，用于触发作用域的创建和销毁。
 * @param {(reset: () => void) => void} fn 在作用域内执行的函数，接受一个 reset 函数作为参数，用于重置作用域。
 * @see https://v3.vuejs.org/api/composition-api.html#effectscope
 */
export function useToggleScope(source: WatchSource<boolean>, fn: (reset: () => void) => void) {
  let scope: EffectScope | undefined
  function start() {
    scope = effectScope()
    scope.run(() => fn.length
      ? fn(() => { scope?.stop(); start() })
      : (fn as any)(),
    )
  }

  watch(source, (active) => {
    if (active && !scope) {
      start()
    }
    else if (!active) {
      scope?.stop()
      scope = undefined
    }
  }, { immediate: true })

  onScopeDispose(() => {
    scope?.stop()
  })
}
