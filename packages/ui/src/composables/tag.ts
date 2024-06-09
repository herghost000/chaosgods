import { propsFactory } from '@/util'

export interface TagProps {
  tag: string
}

export const makeTagProps = propsFactory({
  tag: {
    type: String,
    default: 'div',
  },
}, 'tag')
