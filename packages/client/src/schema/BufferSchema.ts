import type { AnyTypeSchema } from './AnyTypeSchema'
import type { ArrayTypeSchema } from './ArrayTypeSchema'
import type { BooleanTypeSchema } from './BooleanTypeSchema'
import type { BufferTypeSchema } from './BufferTypeSchema'
import type { CustomTypeSchema } from './CustomTypeSchema'
import type { DateTypeSchema } from './DateTypeSchema'
import type { EnumTypeSchema } from './EnumTypeSchema'
import type { IndexedAccessTypeSchema } from './IndexedAccessTypeSchema'
import type { InterfaceTypeSchema } from './InterfaceTypeSchema'
import type { IntersectionTypeSchema } from './IntersectionTypeSchema'
import type { KeyofTypeSchema } from './KeyofTypeSchema'
import type { LiteralTypeSchema } from './LiteralTypeSchema'
import type { NonNullableTypeSchema } from './NonNullableTypeSchema'
import type { NumberTypeSchema } from './NumberTypeSchema'
import type { ObjectTypeSchema } from './ObjectTypeSchema'
import type { OmitTypeSchema } from './OmitTypeSchema'
import type { OverwriteTypeSchema } from './OverwriteTypeSchema'
import type { PartialTypeSchema } from './PartialTypeSchema'
import type { PickTypeSchema } from './PickTypeSchema'
import type { ReferenceTypeSchema } from './ReferenceTypeSchema'
import type { StringTypeSchema } from './StringTypeSchema'
import type { TupleTypeSchema } from './TupleTypeSchema'
import type { UnionTypeSchema } from './UnionTypeSchema'

/**
 * @zh TypeScript 类型模式
 *
 * @en Schema for TypeScript Types
 */
export type BufferSchema = (BooleanTypeSchema
  | NumberTypeSchema
  | StringTypeSchema
  | ArrayTypeSchema
  | TupleTypeSchema
  | EnumTypeSchema
  | AnyTypeSchema
  | LiteralTypeSchema
  | ObjectTypeSchema
  | InterfaceTypeSchema
  | BufferTypeSchema
  | IndexedAccessTypeSchema
  | ReferenceTypeSchema
  | KeyofTypeSchema
  | UnionTypeSchema
  | IntersectionTypeSchema
  | PickTypeSchema
  | PartialTypeSchema
  | OmitTypeSchema
  | OverwriteTypeSchema
  | NonNullableTypeSchema
  | DateTypeSchema
  | CustomTypeSchema)
  & { comment?: string }
