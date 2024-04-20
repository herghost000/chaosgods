import type { int } from '../schema/NumberTypeSchema'
import type { ErrorType } from './ErrorType'

export interface ErrorData {
  message: string
  /**
   * @defaultValue ApiError
   */
  type: ErrorType
  code?: string | int

  [key: string]: any
}
