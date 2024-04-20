import type { BaseServiceType } from './BaseServiceType'
import type { BufferProto } from './BufferProto'
import type { ServiceDef } from './ServiceDef'

/**
 * @zh 服务器协议定义
 *
 * @en Server Protocol Definitions
 *
 * @typeParam ServiceType - API request and response types, and Msg types.
 */
export interface ServiceProto<ServiceType extends BaseServiceType = any> {
  version?: number

  /**
   * Service is the basic interactive unit for server and client.
   * Include {@link ApiServiceDef} and {@link MsgServiceDef}.
   */
  services: ServiceDef[]

  /**
   * `BufferProto` that includes all types used by the services.
   *
   * @see
   * {@link BufferProto}
   * {@link BufferSchema}
   */
  types: BufferProto

  /** For IntelliSense in VSCode */
  __SERVICE_TYPE__?: ServiceType
}
