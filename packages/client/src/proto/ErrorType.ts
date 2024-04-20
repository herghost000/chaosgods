export enum ErrorType {
  /** Network error, like connection broken, network timeout, etc. */
  NetworkError = 'NetworkError',
  /**
   * Server exception, for example "request format error", "database exception", etc.
   *
   * @remarks
   * This error message may be not suitable to show to user,
   * but the error info is useful for engineer to find some bug.
   * So you can show a user-friendly message to user (like "System error, please contact XXX"),
   * and report some debug info at the same time.
   */
  ServerError = 'ServerError',
  /**
   * Client exception, for example parse server output error.
   * (May because of the proto file is not the same between server and client)
   */
  ClientError = 'ClientError',
  /**
   * The business error returned by `call.error`.
   * It is always business-relatived, for example `call.error('Password is incorrect')`, `call.error('Not enough credit')`, etc.
   */
  ApiError = 'ApiError',
}
