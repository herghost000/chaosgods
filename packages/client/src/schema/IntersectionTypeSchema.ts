import type { BufferSchema } from './BufferSchema'
/**
 * @zh TypeScript 交集类型，如 "A & B
 *
 * @en TypeScript intersection type, like `A & B`
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types}
 *
 * @example
 * ```ts
 * type X1 = A & B;
 * type X2 = A & (B | C);
 * ```
 */
export interface IntersectionTypeSchema {
  type: 'Intersection'
  members: {
    /** @zh 编码标识符，按以下顺序生成 */
    /** @en Encoding identifier, generated according to the order */
    id: number
    type: BufferSchema
  }[]
}
