import type { InterfaceReference } from '../reference/InterfaceReference'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'
import type { UnionTypeSchema } from './UnionTypeSchema'
import type { IntersectionTypeSchema } from './IntersectionTypeSchema'
/**
 * TypeScript `Partial<Type>`
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype}
 */
export interface PartialTypeSchema {
  type: 'Partial'
  target: InterfaceTypeSchema | InterfaceReference | UnionTypeSchema | IntersectionTypeSchema
}
