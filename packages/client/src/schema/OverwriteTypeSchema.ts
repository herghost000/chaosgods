import type { InterfaceReference } from '../reference/InterfaceReference'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'
/**
 * @zh 实用程序类型，用于覆盖接口的某些属性。
 *
 * @en utility type, which represents overwrite some properties from a interface.
 *
 * @example
 * ```ts
 * import { Overwrite } from 'buffer-schema';
 *
 * interface AAA {
 *     a: string,
 *     b: string
 * }
 *
 * // Equivalent to `{ a: string, b: number, c: number }`
 * type BBB = Overwrite<AAA, {
 *     b: number,
 *     c: number
 * }>
 * ```
 */
export interface OverwriteTypeSchema {
  type: 'Overwrite'
  target: InterfaceTypeSchema | InterfaceReference
  overwrite: InterfaceTypeSchema | InterfaceReference
}
