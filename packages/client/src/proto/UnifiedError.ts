import type { int } from '../schema/NumberTypeSchema'
import { ErrorType } from './ErrorType'
import type { ErrorData } from './ErrorData'

/**
 * @zh 服务器或客户端返回的统一错误信息
 *
 * @en A unified Error that returned by server or client
 *
 * @remarks
 * It has many uses, for example:
 *
 * 1. You can handle business errors and network errors uniformly.
 * 2. In API handle process, `throw new UnifiedError('xxx')` would return the same error to client directly (like `call.error()`),
 * while `throw new Error('XXX')` would return a unified "Server Internal Error".
 */

export class UnifiedError implements ErrorData {
  public static Type = ErrorType

  public message!: string
  public type!: ErrorType
  public code?: string | int;

  [key: string]: any;

  constructor(data: ErrorData)
  /**
   * The `type` is `ApiError` by default
   */
  constructor(message: string, data?: Partial<ErrorData>)
  constructor(dataOrMessage: ErrorData | string, data?: Partial<ErrorData>) {
    if (typeof dataOrMessage === 'string') {
      this.message = dataOrMessage
      this.type = data?.type ?? ErrorType.ApiError
      Object.assign(this, data)
    }
    else {
      Object.assign(this, dataOrMessage)
    }
  }

  toString() {
    return `[${this.type}]: ${this.message}`
  }
}
