/// <reference types="../../../../types/cypress" />
import { ref } from 'vue'
import { CAppBar } from '..'
import { CLayout } from '@/components/CLayout'
import { CMain } from '@/components/CMain'

const SCROLL_OPTIONS = { ensureScrollable: true, duration: 50 }

describe('cAppBar', () => {
  it('allows custom height', () => {
    cy
      .mount(({ height }: any) => (
        <CLayout>
          <CAppBar height={height} />
        </CLayout>
      ))
      .get('.v-app-bar').should('have.css', 'height', '64px')
      .setProps({ height: 128 })
      .get('.v-app-bar').should('have.css', 'height', '128px')
  })

  it('supports density', () => {
    cy
      .mount(({ density = 'default' }: any) => (
        <CLayout>
          <CAppBar density={density} />
        </CLayout>
      ))
      .get('.v-app-bar').should('have.css', 'height', '64px')
      .setProps({ density: 'prominent' })
      .get('.v-app-bar').should('have.css', 'height', '128px')
      .setProps({ density: 'comfortable' })
      .get('.v-app-bar').should('have.css', 'height', '56px')
      .setProps({ density: 'compact' })
      .get('.v-app-bar').should('have.css', 'height', '48px')
  })

  it('is hidden on mount', () => {
    const model = ref(false)

    cy
      .mount(() => (
        <CLayout>
          <CAppBar v-model={model.value} />
        </CLayout>
      ))
      .get('.v-app-bar')
      .should('not.be.visible')
      .then(() => (model.value = true))
      .get('.v-app-bar')
      .should('be.visible')
  })

  describe('scroll behavior', () => {
    it('hides', () => {
      cy.mount(({ scrollBehavior }: any) => (
        <CLayout>
          <CAppBar scrollBehavior={scrollBehavior} />

          <CMain style="min-height: 200vh;" />
        </CLayout>
      ))
        .setProps({ scrollBehavior: 'hide' })
        .get('.v-app-bar').should('be.visible')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('not.be.visible')
        .window().scrollTo(0, 250, SCROLL_OPTIONS)
        .get('.v-app-bar').should('be.visible')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
        .get('.v-app-bar').should('be.visible')

        .setProps({ scrollBehavior: 'hide inverted' })
        .get('.v-app-bar').should('not.be.visible')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('be.visible')
        .window().scrollTo(0, 250, SCROLL_OPTIONS)
        .get('.v-app-bar').should('not.be.visible')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
        .get('.v-app-bar').should('not.be.visible')
    })

    it('collapses', () => {
      cy.mount(({ scrollBehavior }: any) => (
        <CLayout>
          <CAppBar scrollBehavior={scrollBehavior} />

          <CMain style="min-height: 200vh;" />
        </CLayout>
      ))
        .setProps({ scrollBehavior: 'collapse' })
        .get('.v-app-bar').should('be.visible')
        .get('.v-app-bar').should('have.not.class', 'v-toolbar--collapse')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('have.class', 'v-toolbar--collapse')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)

        .setProps({ scrollBehavior: 'collapse inverted' })
        .get('.v-app-bar').should('be.visible')
        .get('.v-app-bar').should('have.class', 'v-toolbar--collapse')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('not.have.class', 'v-toolbar--collapse')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
    })

    it('elevates', () => {
      cy.mount(({ scrollBehavior }: any) => (
        <CLayout>
          <CAppBar scrollBehavior={scrollBehavior} />

          <CMain style="min-height: 200vh;" />
        </CLayout>
      ))
        .setProps({ scrollBehavior: 'elevate' })
        .get('.v-app-bar').should('have.class', 'v-toolbar--flat')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('not.have.class', 'v-toolbar--flat')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)

        .setProps({ scrollBehavior: 'elevate inverted' })
        .get('.v-app-bar').should('not.have.class', 'v-toolbar--flat')
        .window().scrollTo(0, 500, SCROLL_OPTIONS)
        .get('.v-app-bar').should('have.class', 'v-toolbar--flat')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
    })

    it('fades image', () => {
      cy.mount(({ scrollBehavior, image }: any) => (
        <CLayout>
          <CAppBar
            image={image}
            scrollBehavior={scrollBehavior}
          />

          <CMain style="min-height: 200vh;" />
        </CLayout>
      ))
        .setProps({
          image: 'https://picsum.photos/1920/1080?random',
          scrollBehavior: 'fade-image',
        })
        .get('.v-toolbar__image').should('have.css', 'opacity', '1')
        .window().scrollTo(0, 150, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0.5')
        .window().scrollTo(0, 300, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0')
        .window().scrollTo(0, 60, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0.8')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '1')

        .setProps({ scrollBehavior: 'fade-image inverted' })
        .get('.v-toolbar__image').should('have.css', 'opacity', '0')
        .window().scrollTo(0, 150, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0.5')
        .window().scrollTo(0, 300, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '1')
        .window().scrollTo(0, 60, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0.2')
        .window().scrollTo(0, 0, SCROLL_OPTIONS)
        .get('.v-toolbar__image').should('have.css', 'opacity', '0')
    })
  })
})
