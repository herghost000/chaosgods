import type { InterfaceReference } from '../reference/InterfaceReference'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'
import type { UnionTypeSchema } from './UnionTypeSchema'
import type { IntersectionTypeSchema } from './IntersectionTypeSchema'

/**
 * @zh TypeScript `Omit` 类型
 * 表示省略接口的某些属性。
 *
 * @en TypeScript `Omit` type,
 * represents omit some properties from a interface.
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys}
 *
 * @example
 * ```ts
 * interface AAA {
 *     a: string,
 *     b: string,
 *     c: string
 * }
 *
 * // Equivalent to `{ c: string }`
 * type BBB = Omit<AAA, 'a' | 'b'>;
 * ```
 */
export interface OmitTypeSchema {
  type: 'Omit'
  target: InterfaceTypeSchema | InterfaceReference | UnionTypeSchema | IntersectionTypeSchema
  keys: string[]
}
