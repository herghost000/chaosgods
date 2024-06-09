import {
  createCssTransition,
  createJavascriptTransition,
} from './createTransition'

import ExpandTransitionGenerator from './expand-transition'

// Component specific transitions
export const CFabTransition = createCssTransition('fab-transition', 'center center', 'out-in')

// Generic transitions
export const CDialogBottomTransition = createCssTransition('dialog-bottom-transition')
export const CDialogTopTransition = createCssTransition('dialog-top-transition')
export const CFadeTransition = createCssTransition('fade-transition')
export const CScaleTransition = createCssTransition('scale-transition')
export const CScrollXTransition = createCssTransition('scroll-x-transition')
export const CScrollXReverseTransition = createCssTransition('scroll-x-reverse-transition')
export const CScrollYTransition = createCssTransition('scroll-y-transition')
export const CScrollYReverseTransition = createCssTransition('scroll-y-reverse-transition')
export const CSlideXTransition = createCssTransition('slide-x-transition')
export const CSlideXReverseTransition = createCssTransition('slide-x-reverse-transition')
export const CSlideYTransition = createCssTransition('slide-y-transition')
export const CSlideYReverseTransition = createCssTransition('slide-y-reverse-transition')

// Javascript transitions
export const CExpandTransition = createJavascriptTransition('expand-transition', ExpandTransitionGenerator())
export const CExpandXTransition = createJavascriptTransition('expand-x-transition', ExpandTransitionGenerator('', true))

export { CDialogTransition } from './dialog-transition'

export type CFabTransition = InstanceType<typeof CFabTransition>
export type CDialogBottomTransition = InstanceType<typeof CDialogBottomTransition>
export type CDialogTopTransition = InstanceType<typeof CDialogTopTransition>
export type CFadeTransition = InstanceType<typeof CFadeTransition>
export type CScaleTransition = InstanceType<typeof CScaleTransition>
export type CScrollXTransition = InstanceType<typeof CScrollXTransition>
export type CScrollXReverseTransition = InstanceType<typeof CScrollXReverseTransition>
export type CScrollYTransition = InstanceType<typeof CScrollYTransition>
export type CScrollYReverseTransition = InstanceType<typeof CScrollYReverseTransition>
export type CSlideXTransition = InstanceType<typeof CSlideXTransition>
export type CSlideXReverseTransition = InstanceType<typeof CSlideXReverseTransition>
export type CSlideYTransition = InstanceType<typeof CSlideYTransition>
export type CSlideYReverseTransition = InstanceType<typeof CSlideYReverseTransition>
export type CExpandTransition = InstanceType<typeof CExpandTransition>
export type CExpandXTransition = InstanceType<typeof CExpandXTransition>
