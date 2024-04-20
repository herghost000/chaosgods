import type { Logger } from './logger'

/**
 * @en receiving messages manager
 */
export class MessageManager {
  private _handlers: { [msgName: string]: Function[] | undefined } = {}

  /**
   * Execute all handlers parallelly
   * @returns handlers count
   */
  public forEach(msgName: string, logger: Logger | undefined, ...args: any[]): (any | Promise<any>)[] {
    const handlers = this._handlers[msgName]
    if (!handlers)
      return []

    const output: (any | Promise<any>)[] = []
    for (const handler of handlers) {
      try {
        output.push(handler(...args))
      }
      catch (e) {
        logger?.error('[MsgHandlerError]', e)
      }
    }
    return output
  }

  /**
   * @en Add message handler, duplicate handlers to the same `msgName` would be ignored.
   *
   * @param {string} msgName
   * @param {Function} handler
   * @memberof MsgHandlerManager
   */
  public add(msgName: string, handler: Function) {
    let handlers = this._handlers[msgName]
    // 初始化Handlers
    if (!handlers)
      handlers = this._handlers[msgName] = []

    // 防止重复监听
    else if (handlers.includes(handler))
      return

    handlers.push(handler)
  }

  /**
   * Remove handler from the specific `msgName`
   *
   * @param {string} msgName
   * @param {Function} handler
   * @memberof MsgHandlerManager
   */
  public remove(msgName: string, handler: Function) {
    const handlers = this._handlers[msgName]
    if (!handlers)
      return

    const spIndex = handlers.findIndex(v => v === handler)
    if (spIndex !== -1)
      handlers.splice(spIndex, 1)
  }

  /**
   * Remove all handlers for the specific `msgName`
   *
   * @param {string} msgName
   * @memberof MessageManager
   */
  public removeAll(msgName: string) {
    this._handlers[msgName] = undefined
  }
}
