/**
 * @zh 抽象日志记录器接口，可用于自定义日志行为。
 * 为了方便起见，通常可以通过 `console`。
 * 也可以编写自己的实现，例如，向日志系统报告或隐藏某些日志输出。
 *
 * @en An abstract logger interface, which can be used to customize log behaviour.
 * Usually, you can pass `console` for convinience.
 * Or you can write your own implementation, for example, to report to a log system, or hide some log output.
 */
export interface Logger {
  debug: (...args: any[]) => void
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

function empty() { }

export function setLogLevel(logger: Logger, logLevel: LogLevel): Logger {
  switch (logLevel) {
    case 'none':
      return { debug: empty, log: empty, warn: empty, error: empty }
    case 'error':
      return { debug: empty, log: empty, warn: empty, error: logger.error.bind(logger) }
    case 'warn':
      return { debug: empty, log: empty, warn: logger.warn.bind(logger), error: logger.error.bind(logger) }
    case 'info':
      return { debug: empty, log: logger.log.bind(logger), warn: logger.warn.bind(logger), error: logger.error.bind(logger) }
    case 'debug':
      return logger
    default:
      throw new Error(`Invalid logLevel: '${logLevel}'`)
  }
}
