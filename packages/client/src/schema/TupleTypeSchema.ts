import type { BufferSchema } from './BufferSchema'
/**
 * @zh TypeScript `Tuple` 类型
 * @en TypeScript `Tuple` type
 *
 * @remarks
 * It has less encoded size than `Array`.
 *
 * See: {@link https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types}
 */
export interface TupleTypeSchema {
  type: 'Tuple'
  elementTypes: BufferSchema[]
  optionalStartIndex?: number
}
