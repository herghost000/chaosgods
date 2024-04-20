import type { uint } from '../schema/NumberTypeSchema'
import type { ErrorData } from './ErrorData'

/**
 * @zh 基本传输数据单元、
 * 代表服务器通过 `call.succ` 或 `call.error` 或 `conn.sendMsg` 发送的数据。
 *
 * @en Basic transport data unit,
 * which represents data that server sent by `call.succ` or `call.error` or `conn.sendMsg`.
 */
export interface ServerOutputData {
  /** ApiResponse or Msg */
  buffer?: Uint8Array
  /** Api Error, cannot exists at the same time with `buffer` */
  error?: ErrorData

  /** Short link apiRes don't need this */
  serviceId?: uint
  /** Short link don't need this */
  sn?: uint
}
