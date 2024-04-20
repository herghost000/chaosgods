/**
 * @zh TypeScript `enum` 类型
 * @en TypeScript `enum` type
 *
 * @example
 * ```ts
 * enum JobName {
 *     Teacher,
 *     Doctor,
 *     Salesman
 * }
 *
 * enum Status {
 *     Normal = 'Normal',
 *     Expired = 'Expired'
 * }
 * ```
 */
export interface EnumTypeSchema {
  type: 'Enum'
  members: {
    /** @zh 编码标识符，按以下顺序生成 */
    /** @en Encoding identifier, generated according to the order */
    id: number
    value: string | number
  }[]
}
