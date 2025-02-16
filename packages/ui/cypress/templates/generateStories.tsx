/**
 * Utilities for generating formatted mount functions
 * Some utility functions for mounting these generated examples inside of tests
 */
import type { FunctionalComponent, JSXComponent } from 'vue'

const _ = Cypress._

type Stories = Record<string, JSX.Element>
type Props = Record<string, Boolean | any[]>
type GenerateConfiguration = {
  props: Props
  component: JSXComponent
  stories?: Stories
} | {
  props?: never
  component?: never
  stories: Stories
}

type Example = {
  name: string
  mount: JSX.Element
}

/** Utility components */
const title = (key: string) => <h4 class="my-4">{ key }</h4>

// Spacing between content
const grid = (content: JSX.Element | JSX.Element[]) => <div style="display: flex; gap: 0.8rem;">{ content }</div>

// Spacing between mounted components
const Wrapper: FunctionalComponent = (_, { slots }) => <div class="ma-4">{ slots.default?.() }</div>

/**
 * Generate an array of Examples by iterating over Stories.
 * @param stories An object where the key is the name of the story and the value is the component to be rendered.
 * @returns An array of Examples, where the name of the story is formatted.
 * @example makeExamplesFromStories({
    'small success button': <VBtn color="success" size="small">Done!</VBtn>
  })
 */
export function makeExamplesFromStories(stories: Stories): Example[] {
  return Object.entries(stories).reduce((acc: Example[], [key, value]) => {
    acc.push({
      name: key,
      mount: (
        <Wrapper>
          { title(key) }
          { grid(value) }
        </Wrapper>
      ),
    })
    return acc
  }, [])
}

/**
 * Generate a list of Examples by iterating over all passed in Props.
 * @param props A configuration object of props to call
 * @param Component The component to be mounted with those specific props.
 * @returns An array of Examples
 * @example makeExamplesFromProps({
    color: ['success', 'error' ],
    icon: true
   }, VBtn)
 */
export function makeExamplesFromProps(props: Props, Component: JSXComponent): Example[] {
  return Object.entries(props).reduce((acc: Example[], [key, value]) => {
    // Collect an array of examples by prop.
    const variants: JSX.Element[] = []

    // Props with boolean values should be rendered with both their true/false states
    if (_.isBoolean(value)) {
      variants.push(
        <Component {...{ [key]: true }}>
          Is
          { key }
        </Component>,
      )
      variants.push(
        <Component {...{ [key]: false }}>
          Is not
          { key }
        </Component>,
      )
    }
    else if (_.isArray(value)) {
      // Props with array values should be iterated over
      value.forEach((v) => {
        variants.push(<Component {... { [key]: v }}>{ v }</Component>)
      })
    }

    acc.push({
      name: key,
      mount: (
        <Wrapper>
          { title(key) }
          { grid(variants) }
        </Wrapper>
      ),
    })
    return acc
  }, [])
}

/**
 * Generate a single `it` block with all of the stories and examples passed in
 *
 * @export
 * @param {GenerateConfiguration} { props, stories, component }
 * @return {*}
 */
export function generate({ props, stories, component }: GenerateConfiguration) {
  let exampleStories: Example[]
  let exampleProps: Example[]
  if (stories)
    exampleStories = makeExamplesFromStories(stories)

  if (props && !component)
    throw new Error('Cannot generate examples from props without a component')
  if (props && component)
    exampleProps = makeExamplesFromProps(props, component)

  return it('renders everything', () => {
    cy.mount(() => (
      <>
        { exampleStories && (
          <>
            <h2 class="mx-4 mt-10 mb-4">Stories</h2>
            { exampleStories.map(s => s.mount) }
          </>
        )}
        { exampleProps && (
          <>
            <h2 class="mx-4 mt-10 mb-4">Props</h2>
            { exampleProps.map(s => s.mount) }
          </>
        )}
      </>
    )).percySnapshot()
  })
}

/**
 *  Generate one `it` block per example passed in
 *
 * @export
 * @param {Stories} stories
 * @return {*}
 */
export function generateByExample(stories: Stories) {
  return makeExamplesFromStories(stories).map(({ name, mount }) => {
    return it(name, () => { cy.mount(() => <>{ mount }</>) })
  })
}

/**
 * Generate one `it` block per prop passed in and render all applicable variants for those props
 *
 * @export
 * @param {Props} props
 * @param {JSXComponent} component
 * @return {*}
 */
export function generateByProps(props: Props, component: JSXComponent) {
  return makeExamplesFromProps(props, component).map(({ mount, name }) => {
    return it(name, () => { cy.mount(() => <>{ mount }</>) })
  })
}
