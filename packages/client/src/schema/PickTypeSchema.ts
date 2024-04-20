import type { InterfaceReference } from '../reference/InterfaceReference'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'
import type { UnionTypeSchema } from './UnionTypeSchema'
import type { IntersectionTypeSchema } from './IntersectionTypeSchema'
/**
 * TypeScript `Pick<Type>`
 *
 * @remarks
 * See: {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys}
 */
export interface PickTypeSchema {
  type: 'Pick'
  target: InterfaceTypeSchema | InterfaceReference | UnionTypeSchema | IntersectionTypeSchema
  keys: string[]
}
