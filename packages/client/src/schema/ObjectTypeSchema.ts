/**
 * @zh TypeScript `object` 类型
 * @en TypeScript `object` type
 *
 * @zh `object` 类型不是 `number`, `string`, `boolean`, `bigint`, `symbol`, `null`, 或 `undefined`
 * @en Represents anything that is not `number`, `string`, `boolean`, `bigint`, `symbol`, `null`, or `undefined`.
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#object}
 *
 * @example
 * ```ts
 * let a: object;
 * ```
 */
export interface ObjectTypeSchema {
  type: 'Object'
}
