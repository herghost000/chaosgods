import type { IndexedAccessTypeSchema } from '../schema/IndexedAccessTypeSchema'
import type { KeyofTypeSchema } from '../schema/KeyofTypeSchema'
import type { ReferenceTypeSchema } from '../schema/ReferenceTypeSchema'

export type TypeReference = ReferenceTypeSchema | IndexedAccessTypeSchema | KeyofTypeSchema
