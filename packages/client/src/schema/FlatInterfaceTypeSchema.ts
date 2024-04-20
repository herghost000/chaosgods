import type { InterfaceTypeSchema } from './InterfaceTypeSchema'

export interface FlatInterfaceTypeSchema {
  type: InterfaceTypeSchema['type']
  properties: NonNullable<InterfaceTypeSchema['properties']>
  indexSignature?: InterfaceTypeSchema['indexSignature']
}
