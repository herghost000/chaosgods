/**
 * @zh 自增计数器
 *
 * @en An auto-increment counter
 */
export class Counter {
  private _min: number
  private _max: number
  private _last: number

  /**
   * Last return of `getNext()`
   */
  public get last() {
    return this._last
  }

  constructor(min: number = 1, max: number = Number.MAX_SAFE_INTEGER) {
    this._min = min
    this._max = max
    this._last = max
  }

  /**
   * Reset the counter, makes `getNext()` restart from `0`
   */
  public reset() {
    this._last = this._max
  }

  /**
   * Get next counter value, and auto increment `1`
   * @param notInc - Just get the next possible value, not actually increasing the sequence
   */
  public getNext(notInc?: boolean) {
    return this._last >= this._max ? (this._last = this._min) : (notInc ? this._last : ++this._last)
  }
}
