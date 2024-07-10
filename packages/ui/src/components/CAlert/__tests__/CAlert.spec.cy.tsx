import { CAlert } from '..'
import { generate } from '@/../cypress/templates'

const defaultColors = ['success', 'info', 'warning', 'error', 'invalid']

const props = {
  color: defaultColors,
  icon: ['$chaos'],
  modelValue: true,
}

const stories = {
  'Default alert': <CAlert modelValue={true} />,
  'Icon alert': <CAlert icon="$chaos" />,
}

// Tests
describe('cAlert', () => {
  describe('color', () => {
    it('supports default color props', () => {
      cy.mount(() => (
        <>
          { defaultColors.map((color, idx) => (
            <CAlert color={color} text={idx.toString()}>
              { color }
              {' '}
              alert
            </CAlert>
          ))}
        </>
      ))
        .get('.v-alert')
        .should('have.length', defaultColors.length)
        .then((subjects) => {
          Array.from(subjects).forEach((subject, idx) => {
            expect(subject).to.contain(defaultColors[idx])
          })
        })
    })
  })

  describe('showcase', () => {
    generate({ stories, props, component: CAlert })
  })
})
