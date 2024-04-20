import type { InterfaceReference } from '../reference/InterfaceReference'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'

/**
 * @zh TypeScript 索引访问类型
 * @en TypeScript indexed access type
 *
 * @remarks
 * `XXX['a' | 'b']` is not a `IndexedAccessType`, which should be a `{@link UnionType}`.
 * (Equivalent to `XXX['a'] | XXX['b']`)
 *
 * {@link https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html}
 *
 * @example
 * ```ts
 * type A = SomeInterface['XXX']
 * ```
 */
export interface IndexedAccessTypeSchema {
  type: 'IndexedAccess'
  objectType: InterfaceTypeSchema | InterfaceReference
  index: string
}
