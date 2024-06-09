// Styles
import './CKbd.sass'

// Utilities
import { createSimpleFunctional } from '@/util'

export const CKbd = createSimpleFunctional('v-kbd')

export type CKbd = InstanceType<typeof CKbd>
