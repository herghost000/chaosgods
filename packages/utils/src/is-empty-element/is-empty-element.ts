import { Comment, Fragment, Text } from 'vue'

export function isEmptyElement(c: any) {
  return c && (c.type === Comment || (c.type === Fragment && c.children.length === 0) || (c.type === Text && c.children.trim() === ''))
}
