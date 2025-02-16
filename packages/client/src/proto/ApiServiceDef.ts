import type { BaseServiceDef } from './BaseServiceDef'

/**
 * Send request and wait for response
 * @remarks
 * SchemaId of request and ressponse is generated by client, named with the prefix `Req` or `Res`.
 */
export interface ApiServiceDef extends BaseServiceDef {
  type: 'api'
  /**
   * Auto generated by `@chaosgods/cli`
   * @example
   * ```ts title="PtlAddComment.ts"
   * export interface ReqAddComment {
   *     articleId: string;
   *     comment: string;
   * }
   *
   * export interface ResAddComment {
   *     commentId: string;
   * }
   *
   * // This would be auto generated to `service.conf`
   * export const conf = {
   *     needLogin: true,
   *     needRoles: ['SuperAdmin', 'ArticleAdmin', 'CommentAdmin']
   * };
   * ```
   */
  conf?: {
    [key: string]: any
  }
}
