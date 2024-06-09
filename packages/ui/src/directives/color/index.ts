import type { DirectiveBinding, VNode } from 'vue'
import {
  classToHex,
  isCssColor,
  parseGradient,
} from '../../util/colorUtils'
import colors from '../../util/colors'
import type { Colors } from '@/composables/theme'

interface BorderModifiers {
  top?: boolean
  right?: boolean
  bottom?: boolean
  left?: boolean
}

function setTextColor(
  el: HTMLElement,
  color: string,
  currentTheme: Partial<Colors>,
) {
  const cssColor = !isCssColor(color) ? classToHex(color, colors, currentTheme) : color

  el.style.color = cssColor
  el.style.caretColor = cssColor
}

function setBackgroundColor(
  el: HTMLElement,
  color: string,
  currentTheme: Partial<Colors>,
) {
  const cssColor = !isCssColor(color) ? classToHex(color, colors, currentTheme) : color

  el.style.backgroundColor = cssColor
  el.style.borderColor = cssColor
}

function setBorderColor(
  el: HTMLElement,
  color: string,
  currentTheme: Partial<Colors>,
  modifiers?: BorderModifiers,
) {
  const cssColor = !isCssColor(color) ? classToHex(color, colors, currentTheme) : color

  if (!modifiers || !Object.keys(modifiers).length) {
    el.style.borderColor = cssColor
    return
  }

  if (modifiers.top)
    el.style.borderTopColor = cssColor
  if (modifiers.right)
    el.style.borderRightColor = cssColor
  if (modifiers.bottom)
    el.style.borderBottomColor = cssColor
  if (modifiers.left)
    el.style.borderLeftColor = cssColor
}

function setGradientColor(
  el: HTMLElement,
  gradient: string,
  currentTheme: Partial<Colors>,
) {
  el.style.backgroundImage = `linear-gradient(${
    parseGradient(gradient, colors, currentTheme)
  })`
}

function updateColor(
  el: HTMLElement,
  binding: DirectiveBinding,
  node: VNode,
) {
  const currentTheme = (node as any).context.$chaos.theme.currentTheme

  if (binding.arg === undefined)
    setBackgroundColor(el, binding.value, currentTheme)
  else if (binding.arg === 'text')
    setTextColor(el, binding.value, currentTheme)
  else if (binding.arg === 'border')
    setBorderColor(el, binding.value, currentTheme, binding.modifiers)
  else if (binding.arg === 'gradient')
    setGradientColor(el, binding.value, currentTheme)
}

function update(
  el: HTMLElement,
  binding: DirectiveBinding,
  node: VNode,
) {
  if (binding.value === binding.oldValue)
    return

  updateColor(el, binding, node)
}

export const Color = {
  bind: updateColor,
  update,
}

export default Color
