import { warn } from 'vue'

export function consoleWarn(message: string): void {
  warn(`Chaos: ${message}`)
}

export function consoleError(message: string): void {
  warn(`Chaos error: ${message}`)
}

export function deprecate(original: string, replacement: string | string[]) {
  replacement = Array.isArray(replacement)
    ? `${replacement.slice(0, -1).map(s => `'${s}'`).join(', ')} or '${replacement.at(-1)}'`
    : `'${replacement}'`
  warn(`[Chaos UPGRADE] '${original}' is deprecated, use ${replacement} instead.`)
}
export function breaking(original: string, replacement: string) {
  warn(`[Chaos BREAKING] '${original}' has been removed, use '${replacement}' instead. For more information, see the upgrade guide https://github.com/herghost000/chaosgods/releases/tag/v2.0.0#user-content-upgrade-guide`)
}
export function removed(original: string) {
  warn(`[Chaos REMOVED] '${original}' has been removed. You can safely omit it.`)
}
