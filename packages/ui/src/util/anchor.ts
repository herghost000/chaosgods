import { includes } from '@/util/helpers'

const block = ['top', 'bottom'] as const
const inline = ['start', 'end', 'left', 'right'] as const
type Tblock = typeof block[number]
type Tinline = typeof inline[number]
export type Anchor =
  | Tblock
  | Tinline
  | 'center'
  | 'center center'
  | `${Tblock} ${Tinline | 'center'}`
  | `${Tinline} ${Tblock | 'center'}`
export type ParsedAnchor =
  | { side: 'center', align: 'center' }
  | { side: Tblock, align: 'left' | 'right' | 'center' }
  | { side: 'left' | 'right', align: Tblock | 'center' }

/**
 * @zh 解析原始锚点字符串为对象。
 *
 * @param {Anchor} anchor 原始锚点字符串。
 * @param {boolean} isRtl 是否是从右到左的布局。
 * @returns {ParsedAnchor} 返回解析后的锚点对象。
 *
 * @example
 * const anchor = 'top start';
 * const parsedAnchor = parseAnchor(anchor, false);
 * console.log(parsedAnchor); // { side: 'top', align: 'left' }
 */
export function parseAnchor(anchor: Anchor, isRtl: boolean): ParsedAnchor {
  let [side, align] = anchor.split(' ') as [Tblock | Tinline | 'center', Tblock | Tinline | 'center' | undefined]
  if (!align) {
    align
      = includes(block, side)
        ? 'start'
        : includes(inline, side)
          ? 'top'
          : 'center'
  }

  return {
    side: toPhysical(side, isRtl),
    align: toPhysical(align, isRtl),
  } as ParsedAnchor
}

/**
 * @zh 将逻辑方向转换为物理方向。
 *
 * @param {'center' | Tblock | Tinline} str 逻辑方向。
 * @param {boolean} isRtl 是否是从右到左的布局。
 * @returns {'center' | Tblock | Tinline} 返回物理方向。
 */
export function toPhysical(str: 'center' | Tblock | Tinline, isRtl: boolean): 'center' | Tblock | Tinline {
  if (str === 'start')
    return isRtl ? 'right' : 'left'
  if (str === 'end')
    return isRtl ? 'left' : 'right'
  return str
}

/**
 * @zh 翻转锚点对象的边。
 *
 * @param {ParsedAnchor} anchor 要翻转的锚点对象。
 * @returns {ParsedAnchor} 返回翻转后的锚点对象。
 */
export function flipSide(anchor: ParsedAnchor): ParsedAnchor {
  return {
    side: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    }[anchor.side],
    align: anchor.align,
  } as ParsedAnchor
}

/**
 * @zh 翻转锚点对象的对齐方式。
 *
 * @param {ParsedAnchor} anchor 要翻转的锚点对象。
 * @returns {ParsedAnchor} 返回翻转后的锚点对象。
 */
export function flipAlign(anchor: ParsedAnchor): ParsedAnchor {
  return {
    side: anchor.side,
    align: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    }[anchor.align],
  } as ParsedAnchor
}

/**
 * @zh 将锚点对象的边和对齐方式互换。
 *
 * @param {ParsedAnchor} anchor 要转换的锚点对象。
 * @returns {ParsedAnchor} 返回转换后的锚点对象。
 */
export function flipCorner(anchor: ParsedAnchor): ParsedAnchor {
  return {
    side: anchor.align,
    align: anchor.side,
  } as ParsedAnchor
}

/**
 * @zh 获取锚点对象所在轴。
 *
 * @param {ParsedAnchor} anchor 锚点对象。
 * @returns {'x' | 'y'} 返回锚点对象所在轴。
 */
export function getAxis(anchor: ParsedAnchor) {
  return includes(block, anchor.side) ? 'y' : 'x'
}
