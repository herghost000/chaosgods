// Utilities
import { Box } from '@/util/box'

/**
 * @zh 将元素的 CSS 变换（transform）置为空，然后获取元素的矩形框。
 * @en Set the element's CSS transform to null and get the element's rectangular box.
 *
 * @export
 * @param {HTMLElement} el 要处理的元素。
 * @returns {Box} 返回去除 CSS 变换后的元素矩形框。
 * @see https://stackoverflow.com/a/57876601/2074736
 */
export function nullifyTransforms(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const tx = style.transform

  if (tx) {
    let ta, sx, sy, dx, dy
    if (tx.startsWith('matrix3d(')) {
      ta = tx.slice(9, -1).split(/, /)
      sx = +ta[0]
      sy = +ta[5]
      dx = +ta[12]
      dy = +ta[13]
    }
    else if (tx.startsWith('matrix(')) {
      ta = tx.slice(7, -1).split(/, /)
      sx = +ta[0]
      sy = +ta[3]
      dx = +ta[4]
      dy = +ta[5]
    }
    else {
      return new Box(rect)
    }

    const to = style.transformOrigin
    const x = rect.x - dx - (1 - sx) * Number.parseFloat(to)
    const y = rect.y - dy - (1 - sy) * Number.parseFloat(to.slice(to.indexOf(' ') + 1))
    const w = sx ? rect.width / sx : el.offsetWidth + 1
    const h = sy ? rect.height / sy : el.offsetHeight + 1

    return new Box({ x, y, width: w, height: h })
  }
  else {
    return new Box(rect)
  }
}

/**
 * @zh 对元素进行动画操作。
 * @en Animates an element.
 *
 * @param {Element} el 要进行动画操作的元素。
 * @param {Keyframe[] | PropertyIndexedKeyframes | null} keyframes 动画关键帧。
 * @param {number | KeyframeAnimationOptions} [options] 动画选项。
 * @returns {Animation | { finished: Promise<Animation> }} 返回一个 Animation 对象或包含 finished 属性的对象，finished 属性是一个 Promise，表示动画完成。
 *
 * @example
 * const element = document.getElementById('example');
 * const keyframes = [
 *   { transform: 'translateX(0px)' },
 *   { transform: 'translateX(100px)' }
 * ];
 * const options = {
 *   duration: 1000,
 *   easing: 'ease-in-out',
 *   iterations: Infinity
 * };
 * const animation = animate(element, keyframes, options);
 * animation.finished.then(() => {
 *   console.log('Animation finished');
 * });
 */
export function animate(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: number | KeyframeAnimationOptions,
): Animation | {
  finished: Promise<void>
} {
  if (typeof el.animate === 'undefined')
    return { finished: Promise.resolve() }

  let animation: Animation
  try {
    animation = el.animate(keyframes, options)
  }
  catch (err) {
    return { finished: Promise.resolve() }
  }

  if (typeof animation.finished === 'undefined') {
    (animation as any).finished = new Promise((resolve) => {
      animation.onfinish = () => {
        resolve(animation)
      }
    })
  }

  return animation
}
