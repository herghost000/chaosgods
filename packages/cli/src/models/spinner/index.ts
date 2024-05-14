import { oraPromise } from 'ora'
import { template } from 'lodash'
import type Config from '../config'
import type { ConfigOptions } from '../config/types'

export default class Spinner {
  public config: Config
  constructor(config: Config) {
    this.config = config
  }

  public show<T>(task: () => Promise<T>, label: string, context?: ConfigOptions): Promise<T> {
    const awaitTask = task()

    const text = template(label)(context)
    oraPromise(awaitTask, text)

    return awaitTask
  }
}
