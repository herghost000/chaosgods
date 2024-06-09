/**
 * @zh WCAG 3.0 APCA 感知对比度算法，来自 https://github.com/Myndex/SAPC-APCA
 * @en WCAG 3.0 APCA perceptual contrast algorithm from https://github.com/Myndex/SAPC-APCA
 *
 * @licence https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 * @see https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup
 */

// ANCHOR 类型
import type { RGB } from '@/util'

/**
 * @zh 魔法数字
 * sRGB 转换为相对亮度（Y）
 * sRGB 线性化的转移曲线（也称为 "Gamma"）
 * 简单的幂次曲线与文档中描述的分段曲线
 * 实际上，2.4 最好地模拟了实际显示的特征
 *
 * @en MAGICAL NUMBERS
 * sRGB Conversion to Relative Luminance (Y)
 * Simple power curve vs piecewise described in docs
 * Essentially, 2.4 best models actual display
 */
const mainTRC = 2.4

/**
 * @zh sRGB 红色系数（来自矩阵）
 * @en sRGB Red Coefficient (from matrix)
 */
const Rco = 0.2126729 // sRGB 红色系数（来自矩阵）
/**
 * @zh sRGB 绿色系数（来自矩阵）
 * @en sRGB Green Coefficient (from matrix)
 */
const Gco = 0.7151522 // sRGB 绿色系数（来自矩阵）
/**
 * @zh sRGB 蓝色系数（来自矩阵）
 * @en sRGB Blue Coefficient (from matrix)
 */
const Bco = 0.0721750 // sRGB 蓝色系数（来自矩阵）

// @zh 用于从相对亮度（Y）中找到原始 SAPC 对比度
// SAPC 功率曲线指数的常量
// 一个用于正常文本，另一个用于反向文本
// 这些是 SAPC 的"核心"
// @en For Finding Raw SAPC Contrast from Relative Luminance (Y)
// Constants for SAPC Power Curve Exponents
// One pair for normal text, and one for reverse
// These are the "beating heart" of SAPC

const normBG = 0.55
const normTXT = 0.58
const revTXT = 0.57
const revBG = 0.62

// @zh 用于夹紧和缩放值
// @en For Clamping and Scaling Values

/**
 * @zh 触发软黑夹紧的级别
 * @en Level that triggers the soft black clamp
 */
const blkThrs = 0.03
/**
 * @zh 软黑夹紧曲线的指数
 * @en Exponent for the soft black clamp curve
 */
const blkClmp = 1.45
/**
 * @zh 代码检查陷阱
 * @en Lint trap
 */
const deltaYmin = 0.0005
/**
 * @zh 用于浅色背景上的深色文本的缩放
 * @en Scaling for dark text on light
 */
const scaleBoW = 1.25
/**
 * @zh 用于深色背景上的浅色文本的缩放
 * @en Scaling for light text on dark
 */
const scaleWoB = 1.25
/**
 * @zh 新简单偏移比例的阈值
 * @en Threshold for new simple offset scale
 */
const loConThresh = 0.078
/**
 * = 1/0.078,
 */
const loConFactor = 12.82051282051282
/**
 * @zh 简单偏移
 * @en The simple offset
 */
const loConOffset = 0.06
/**
 * @zh 输出剪切（代码检查陷阱 #2）
 * @en Output clip (lint trap #2)
 */
const loClip = 0.001

export function APCAcontrast(text: RGB, background: RGB) {
  // @zh 线性化 sRGB
  // @en Linearize sRGB
  const Rtxt = (text.r / 255) ** mainTRC
  const Gtxt = (text.g / 255) ** mainTRC
  const Btxt = (text.b / 255) ** mainTRC

  const Rbg = (background.r / 255) ** mainTRC
  const Gbg = (background.g / 255) ** mainTRC
  const Bbg = (background.b / 255) ** mainTRC

  // @zh 将标准系数和求和应用于 Y
  // @en Apply the standard coefficients and sum to Y
  let Ytxt = (Rtxt * Rco) + (Gtxt * Gco) + (Btxt * Bco)
  let Ybg = (Rbg * Rco) + (Gbg * Gco) + (Bbg * Bco)

  // @zh 在接近黑色时对 Y 进行软夹紧。
  // 现在对所有颜色进行夹紧以防止交叉错误
  // @en Soft clamp Y when near black.
  // Now clamping all colors to prevent crossover errors
  if (Ytxt <= blkThrs)
    Ytxt += (blkThrs - Ytxt) ** blkClmp
  if (Ybg <= blkThrs)
    Ybg += (blkThrs - Ybg) ** blkClmp

  // 提前返回 0 对于极低的 ∆Y 值（代码检查陷阱 #1）
  // Return 0 Early for extremely low ∆Y (lint trap #1)
  if (Math.abs(Ybg - Ytxt) < deltaYmin)
    return 0.0

  // @zh SAPC 对比
  // @en SAPC CONTRAST
  // @zh 用于加权最终值
  // @en For weighted final values
  let outputContrast: number
  if (Ybg > Ytxt) {
    // @zh 对于正常极性，黑色文本在白色背景上
    // 计算 SAPC 对比度值并进行缩放
    // @en For normal polarity, black text on white
    // Calculate the SAPC contrast value and scale

    const SAPC = ((Ybg ** normBG) - (Ytxt ** normTXT)) * scaleBoW

    // @zh 新！SAPC SmoothScale™
    // 低对比度平滑缩放发布，以防止极性反转
    // 还有一个用于非常低对比度的低剪切（代码检查陷阱 #2）
    // 这大部分是针对非常低的对比度，小于 10
    // 因此，对于大多数反转需求，只有 loConOffset 是重要的
    // @en NEW! SAPC SmoothScale™
    // Low Contrast Smooth Scale Rollout to prevent polarity reversal
    // and also a low clip for very low contrasts (lint trap #2)
    // much of this is for very low contrasts, less than 10
    // therefore for most reversing needs, only loConOffset is important
    outputContrast
      = (SAPC < loClip)
        ? 0.0
        : (SAPC < loConThresh)
            ? SAPC - SAPC * loConFactor * loConOffset
            : SAPC - loConOffset
  }
  else {
    // @zh 对于反向极性，浅色文本在深色背景上
    // WoB 应始终返回负值。
    // @en For reverse polarity, light text on dark
    // WoB should always return negative value.

    const SAPC = ((Ybg ** revBG) - (Ytxt ** revTXT)) * scaleWoB

    outputContrast
      = (SAPC > -loClip)
        ? 0.0
        : (SAPC > -loConThresh)
            ? SAPC - SAPC * loConFactor * loConOffset
            : SAPC + loConOffset
  }

  return outputContrast * 100
}
