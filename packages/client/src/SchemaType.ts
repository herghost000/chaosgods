/**
 * @zh 各种可能的 `BufferSchema['type']` 枚举
 * @en Enum for every possible `BufferSchema['type']`
 */
export class SchemaType {
  // #region 确定的TypeScript的类型
  static readonly Boolean = 'Boolean'
  static readonly Number = 'Number'
  static readonly String = 'String'
  static readonly Array = 'Array'
  static readonly Tuple = 'Tuple'
  static readonly Enum = 'Enum'
  static readonly Any = 'Any'
  static readonly Literal = 'Literal'
  static readonly Object = 'Object'
  static readonly Interface = 'Interface'
  static readonly Buffer = 'Buffer'
  static readonly IndexedAccess = 'IndexedAccess'
  static readonly Reference = 'Reference'
  static readonly Keyof = 'Keyof'
  static readonly Union = 'Union'
  static readonly Intersection = 'Intersection'
  static readonly NonNullable = 'NonNullable'
  static readonly Date = 'Date'
  // #endregion

  // #region 非TypeScript基本类型，临时过渡用
  static readonly Pick = 'Pick'
  static readonly Partial = 'Partial'
  static readonly Omit = 'Omit'
  static readonly Overwrite = 'Overwrite'
  // #endregion

  static readonly Custom = 'Custom'
}
