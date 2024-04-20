import type { BaseServiceDef } from './BaseServiceDef'

/**
 * @zh 发送或监听特定数据，无需等待响应。
 *
 * @en Send or listen specific data, without waiting for response.
 */
export interface MsgServiceDef extends BaseServiceDef {
  type: 'msg'
  conf?: {
    [key: string]: any
  }
}
