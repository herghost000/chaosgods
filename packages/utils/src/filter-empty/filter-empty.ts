import { Fragment } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { isEmptyElement } from '../is-empty-element/is-empty-element'

export function filterEmpty(children: VNodeChild[] = []) {
  const res: VNodeChild[] = []
  children.forEach((child) => {
    if (Array.isArray(child))
      res.push(...child)
    else if ((child as any)?.type === Fragment)
      res.push(...filterEmpty((child as any).children))
    else
      res.push(child)
  })
  return res.filter(c => !isEmptyElement(c as VNode))
}
