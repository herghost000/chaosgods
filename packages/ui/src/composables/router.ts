import {
  computed,
  nextTick,
  onScopeDispose,
  resolveDynamicComponent,
  toRef,
} from 'vue'
import type { ComputedRef, PropType, Ref, SetupContext } from 'vue'
import type {
  NavigationGuardNext,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  Router,
  UseLinkOptions,
  RouterLink as _RouterLink,
  useLink as _useLink,
} from 'vue-router'
import { IN_BROWSER, deepEqual, getCurrentInstance, hasEvent, propsFactory } from '@/util'
import type { EventProp } from '@/util'

/**
 * @zh 获取当前路由信息的响应式引用。
 *
 * @returns {Ref<RouteLocationNormalizedLoaded | undefined>} 当前路由信息的响应式引用。
 */
export function useRoute(): Ref<RouteLocationNormalizedLoaded | undefined> {
  const vm = getCurrentInstance('useRoute')

  return computed(() => vm?.proxy?.$route)
}

/**
 * @zh 获取当前路由器实例。
 *
 * @returns {Router | undefined} 当前路由器实例，如果不存在则返回 undefined。
 */
export function useRouter(): Router | undefined {
  return getCurrentInstance('useRouter')?.proxy?.$router
}

/**
 * @zh 定义一个接口，用于表示链接组件的属性。
 *
 * @export
 * @interface LinkProps
 * @property {string | undefined} href 组件的 href 属性，表示链接的地址。
 * @property {boolean | undefined} replace 组件的 replace 属性，表示是否替换当前的历史记录。
 * @property {RouteLocationRaw | undefined} to 组件的 to 属性，表示路由目标。
 * @property {boolean | undefined} exact 组件的 exact 属性，表示是否精确匹配。
 */
export interface LinkProps {
  href: string | undefined
  replace: boolean | undefined
  to: RouteLocationRaw | undefined
  exact: boolean | undefined
}

/**
 * @zh 定义一个接口，用于表示链接组件的事件监听器。
 *
 * @export
 * @interface LinkListeners
 * @property {EventProp | undefined} onClick 组件的 onClick 属性，表示点击事件的处理程序。
 * @property {EventProp | undefined} onClickOnce 组件的 onClickOnce 属性，表示仅处理一次的点击事件处理程序。
 */
export interface LinkListeners {
  onClick?: EventProp | undefined
  onClickOnce?: EventProp | undefined
}

/**
 * @zh 定义一个接口，用于表示链接的使用情况。
 *
 * @export
 * @interface UseLink
 * @extends {Omit<Partial<ReturnType<typeof _useLink>>, 'href'>} 从 _useLink 的返回类型中省略 href 属性，并使用其余属性的部分。
 * @property {ComputedRef<boolean>} isLink 组件的 isLink 属性，表示是否为链接。
 * @property {ComputedRef<boolean>} isClickable 组件的 isClickable 属性，表示是否可以点击。
 * @property {Ref<string | undefined>} href 组件的 href 属性，表示链接的地址。
 */
export interface UseLink extends Omit<Partial<ReturnType<typeof _useLink>>, 'href'> {
  isLink: ComputedRef<boolean>
  isClickable: ComputedRef<boolean>
  href: Ref<string | undefined>
}

/**
 * @zh 创建一个用于链接组件的逻辑。
 *
 * @export
 * @param {LinkProps & LinkListeners} props 组件的属性对象，包含 LinkProps 和 LinkListeners。
 * @param {SetupContext['attrs']} attrs 组件的属性对象。
 * @return {*}  {UseLink} 返回一个对象，包含 isLink、isClickable、href 和其他可能的属性。
 */
export function useLink(props: LinkProps & LinkListeners, attrs: SetupContext['attrs']): UseLink {
  const RouterLink = resolveDynamicComponent('RouterLink') as typeof _RouterLink | string

  const isLink = computed(() => !!(props.href || props.to))
  const isClickable = computed(() => {
    return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click')
  })

  if (typeof RouterLink === 'string' || !('useLink' in RouterLink)) {
    return {
      isLink,
      isClickable,
      href: toRef(props, 'href'),
    }
  }
  // vue-router useLink `to` prop needs to be reactive and useLink will crash if undefined
  const linkProps = computed(() => ({
    ...props,
    to: toRef(() => props.to || ''),
  }))

  const routerLink = RouterLink.useLink(linkProps.value as UseLinkOptions)
  // Actual link needs to be undefined when to prop is not used
  const link = computed(() => props.to ? routerLink : undefined)
  const route = useRoute()

  return {
    isLink,
    isClickable,
    route: link.value?.route,
    navigate: link.value?.navigate,
    isActive: computed(() => {
      if (!link.value)
        return false
      if (!props.exact)
        return link.value.isActive?.value ?? false
      if (!route.value)
        return link.value.isExactActive?.value ?? false

      return link.value.isExactActive?.value && deepEqual(link.value.route.value.query, route.value.query)
    }),
    href: computed(() => props.to ? link.value?.route.value.href : props.href),
  }
}

export const makeRouterProps = propsFactory({
  href: String,
  replace: Boolean,
  to: [String, Object] as PropType<RouteLocationRaw>,
  exact: Boolean,
}, 'router')

let inTransition = false
/**
 * @zh 创建一个用于处理浏览器后退按钮逻辑的函数。
 *
 * @export
 * @param {Router | undefined} router Vue 路由实例，用于添加导航守卫。
 * @param {(next: NavigationGuardNext) => void} cb 回调函数，当后退按钮被点击时调用，传递下一个导航钩子。
 */
export function useBackButton(router: Router | undefined, cb: (next: NavigationGuardNext) => void) {
  let popped = false
  let removeBefore: (() => void) | undefined
  let removeAfter: (() => void) | undefined

  if (IN_BROWSER) {
    nextTick(() => {
      window.addEventListener('popstate', onPopstate)
      removeBefore = router?.beforeEach((_to, _from, next) => {
        if (!inTransition)
          setTimeout(() => popped ? cb(next) : next())
        else
          popped ? cb(next) : next()

        inTransition = true
      })
      removeAfter = router?.afterEach(() => {
        inTransition = false
      })
    })
    onScopeDispose(() => {
      window.removeEventListener('popstate', onPopstate)
      removeBefore?.()
      removeAfter?.()
    })
  }

  function onPopstate(e: PopStateEvent) {
    if (e.state?.replaced)
      return

    popped = true
    setTimeout(() => (popped = false))
  }
}
