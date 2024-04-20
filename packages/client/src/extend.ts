/**
 * @zh 重写接口的某些属性
 *
 * @en Overwrite some properties from a interface
 */
export type Overwrite<T, U> = T extends unknown ? Pick<T, Exclude<keyof T, keyof U>> & U : never
export type PickUnion<T, U extends keyof T> = T extends unknown ? Pick<T, U> : never
export type OmitUnion<T, U extends keyof T> = T extends unknown ? Omit<T, U> : never
export type PartialUnion<T> = T extends unknown ? Partial<T> : never
export type EnumValue<T> = T[keyof T]
