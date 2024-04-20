import type { uint } from '../schema/NumberTypeSchema'

/**
 * @zh 基本传输数据单元、
 * 代表服务器收到的数据，应由 `client.callApi` 或 `client.sendMsg` 发送。
 *
 * @en Basic transport data unit,
 * which represents data that server received, which should be sent by `client.callApi` or `client.sendMsg`.
 */
export interface ServerInputData {
  serviceId: uint
  buffer: Uint8Array

  /** Short link don't need this */
  sn?: uint
}
