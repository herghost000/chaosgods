/**
 * @zh 矩形框类，表示一个矩形区域。
 * @en A rectangular box class that represents a rectangular area.
 *
 * @export
 * @class Box
 */
export class Box {
  x: number
  y: number
  width: number
  height: number

  constructor({ x, y, width, height }: {
    x: number
    y: number
    width: number
    height: number
  }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  get top() { return this.y }
  get bottom() { return this.y + this.height }
  get left() { return this.x }
  get right() { return this.x + this.width }
}

/**
 * @zh 获取两个矩形框的溢出情况。
 * @en Get the overflow of two rectangular boxes.
 *
 * @param {Box} a 第一个矩形框。
 * @param {Box} b 第二个矩形框。
 * @returns {{ x: { before: number, after: number }, y: { before: number, after: number } }} 返回一个对象，包含 x 和 y 属性，分别表示水平和垂直方向的溢出情况。
 */
export function getOverflow(a: Box, b: Box): { x: { before: number, after: number }, y: { before: number, after: number } } {
  return {
    x: {
      before: Math.max(0, b.left - a.left),
      after: Math.max(0, a.right - b.right),
    },
    y: {
      before: Math.max(0, b.top - a.top),
      after: Math.max(0, a.bottom - b.bottom),
    },
  }
}

/**
 * @zh 根据目标元素或坐标点获取对应的矩形框。
 * @en Get the corresponding rectangular box based on the target element or coordinate point.
 *
 * @param {(HTMLElement | [x: number, y: number])} target 目标元素或坐标点。
 * @returns {Box} 返回目标元素的矩形框或以坐标点为左上角的矩形框。
 */
export function getTargetBox(target: HTMLElement | [x: number, y: number]): Box {
  if (Array.isArray(target)) {
    return new Box({
      x: target[0],
      y: target[1],
      width: 0,
      height: 0,
    })
  }
  else {
    return target.getBoundingClientRect()
  }
}
