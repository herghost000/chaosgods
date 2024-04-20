import type { InterfaceReference } from '../reference/InterfaceReference'

/**
 * @zh TypeScript `keyof`功能，用于获取接口的键值。
 * @en TypeScript `keyof` feature, to get keys of an interface.
 *
 * @remarks
 * Type:
 * ```ts
 * interface ABC { a: string; b: string }
 * type Keys = keyof ABC;
 * ```
 *
 * Schema:
 * ```json
 * {
 *     type: "keys",
 *     target: {
 *         type: "Reference",
 *         target: "ABC"
 *     }
 * }
 * ```
 */
export interface KeyofTypeSchema {
  type: 'Keyof'
  target: InterfaceReference
}
