import type { BufferSchema } from './BufferSchema'

/**
 * @zh TypeScript `NonNullable<Type>`
 * @en TypeScript `NonNullable<Type>`
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype}
 *
 * @example
 * ```ts
 * type A = NonNullable<B>;
 * ```
 */
export interface NonNullableTypeSchema {
  type: 'NonNullable'
  /** 引用目标l */
  target: BufferSchema
}
