import './CGrid.sass'
import { createSimpleFunctional } from '@/util'

export const CSpacer = createSimpleFunctional('v-spacer', 'div', 'CSpacer')

export type CSpacer = InstanceType<typeof CSpacer>
