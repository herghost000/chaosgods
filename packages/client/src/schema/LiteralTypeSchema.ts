/**
 * @zh TypeScript 字面量类型
 * @en TypeScript literal type
 *
 * @zh 字面类型对于减少编码缓冲区大小非常有用。
 * 无论字面长度有多长，编码缓冲区总是小于 1 字节。
 * @en Literal type is very useful to reduce encoded buffer size.
 * No matter how long the literal is, the encoded buffer is always less than 1 byte.
 *
 * @example
 * ```ts
 * type A = 'XXXX';
 *
 * // Always appears with UnionType, like:
 * type Gender = 'Male' | 'Female';
 * ```
 */
export interface LiteralTypeSchema {
  type: 'Literal'
  // 未定义等同于undefined
  literal?: string | number | boolean | null | undefined
}
