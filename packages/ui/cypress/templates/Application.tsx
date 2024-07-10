import type { FunctionalComponent } from 'vue'
import { CApp } from '@/components/CApp'
import { CLocaleProvider } from '@/components/CLocaleProvider'

export const Application: FunctionalComponent<{ rtl?: boolean }> = (props, { slots, attrs }) => {
  return (
    <CApp {...attrs} rtl={props.rtl}>
      <CLocaleProvider rtl={props.rtl}>
        { slots.default?.() }
      </CLocaleProvider>
    </CApp>
  )
}
