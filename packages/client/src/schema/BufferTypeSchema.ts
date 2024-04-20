/**
 * @zh `Buffer`类型，包括 `ArrayBuffer` 和类型化数组（如 `Uint8Array`、`Int32Array`...）。
 * @en Buffer type, include `ArrayBuffer` and typed arrays (e.g. `Uint8Array`, `Int32Array`...).
 *
 * @example
 * ```ts
 * type A = ArrayBuffer;
 * type B = Uint8Array;
 * ```
 */
export interface BufferTypeSchema {
  type: 'Buffer'
  /**
   * 如果存在`arrayType`，`bufferType`将被忽略
   */
  arrayType?: 'Int8Array' | 'Int16Array' | 'Int32Array' | 'BigInt64Array' | 'Uint8Array' | 'Uint16Array' | 'Uint32Array' | 'BigUint64Array' | 'Float32Array' | 'Float64Array'
}
