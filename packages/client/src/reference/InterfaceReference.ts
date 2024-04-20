import type { OmitTypeSchema } from '../schema/OmitTypeSchema'
import type { OverwriteTypeSchema } from '../schema/OverwriteTypeSchema'
import type { PartialTypeSchema } from '../schema/PartialTypeSchema'
import type { PickTypeSchema } from '../schema/PickTypeSchema'
import type { TypeReference } from './TypeReference'

export type InterfaceReference = TypeReference | PickTypeSchema | PartialTypeSchema | OverwriteTypeSchema | OmitTypeSchema
