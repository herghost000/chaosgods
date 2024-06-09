import { computed } from 'vue'
import { useTextColor } from '@/composables/color'
import { makeComponentProps } from '@/composables/component'
import { makeRouterProps, useLink } from '@/composables/router'
import { makeTagProps } from '@/composables/tag'
import { genericComponent, propsFactory, useRender } from '@/util'

export const makeCBreadcrumbsItemProps = propsFactory({
  active: Boolean,
  activeClass: String,
  activeColor: String,
  color: String,
  disabled: Boolean,
  title: String,

  ...makeComponentProps(),
  ...makeRouterProps(),
  ...makeTagProps({ tag: 'li' }),
}, 'CBreadcrumbsItem')

export const CBreadcrumbsItem = genericComponent()({
  name: 'CBreadcrumbsItem',

  props: makeCBreadcrumbsItemProps(),

  setup(props, { slots, attrs }) {
    const link = useLink(props, attrs)
    const isActive = computed(() => props.active || link.isActive?.value)
    const color = computed(() => isActive.value ? props.activeColor : props.color)

    const { textColorClasses, textColorStyles } = useTextColor(color)

    useRender(() => {
      return (
        <props.tag
          class={[
            'v-breadcrumbs-item',
            {
              'v-breadcrumbs-item--active': isActive.value,
              'v-breadcrumbs-item--disabled': props.disabled,
              [`${props.activeClass}`]: isActive.value && props.activeClass,
            },
            textColorClasses.value,
            props.class,
          ]}
          style={[
            textColorStyles.value,
            props.style,
          ]}
          aria-current={isActive.value ? 'page' : undefined}
        >
          { !link.isLink.value
            ? slots.default?.() ?? props.title
            : (
              <a
                class="v-breadcrumbs-item--link"
                href={link.href.value}
                aria-current={isActive.value ? 'page' : undefined}
                onClick={link.navigate}
              >
                { slots.default?.() ?? props.title }
              </a>
              )}
        </props.tag>
      )
    })
    return {}
  },
})

export type CBreadcrumbsItem = InstanceType<typeof CBreadcrumbsItem>
