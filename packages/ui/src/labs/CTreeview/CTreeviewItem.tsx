import './CTreeviewItem.sass'
import { computed, inject, ref } from 'vue'
import { CProgressCircular } from '../allComponents'
import { CTreeviewSymbol } from './shared'
import { CBtn } from '@/components/CBtn'
import { CListItemAction } from '@/components/CList'
import { CListItem, makeCListItemProps } from '@/components/CList/CListItem'
import { IconValue } from '@/composables/icons'
import { useLink } from '@/composables/router'
import { genericComponent, propsFactory, useRender } from '@/util'
import type { CListItemSlots } from '@/components/CList/CListItem'

export const makeCTreeviewItemProps = propsFactory({
  loading: Boolean,
  toggleIcon: IconValue,

  ...makeCListItemProps({ slim: true }),
}, 'CTreeviewItem')

export const CTreeviewItem = genericComponent<CListItemSlots>()({
  name: 'CTreeviewItem',

  props: makeCTreeviewItemProps(),

  setup(props, { attrs, slots }) {
    const link = useLink(props, attrs)
    const id = computed(() => props.value === undefined ? link.href.value : props.value)
    const vListItemRef = ref<CListItem>()

    const isClickable = computed(() =>
      !props.disabled
      && props.link !== false
      && (props.link || link.isClickable.value || (props.value != null && !!vListItemRef.value?.list)),
    )

    function onClick(e: MouseEvent | KeyboardEvent) {
      if (!vListItemRef.value?.isGroupActivator || !isClickable.value)
        return
      props.value != null && vListItemRef.value?.select(!vListItemRef.value?.isSelected, e)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e as any as MouseEvent)
      }
    }

    const visibleIds = inject(CTreeviewSymbol, { visibleIds: ref() }).visibleIds

    useRender(() => {
      const listItemProps = CListItem.filterProps(props)
      const hasPrepend = slots.prepend || props.toggleIcon

      return (
        <CListItem
          ref={vListItemRef}
          {...listItemProps}
          class={[
            'v-treeview-item',
            {
              'v-treeview-item--filtered': visibleIds.value && !visibleIds.value.has(id.value),
            },
            props.class,
          ]}
          onClick={onClick}
          onKeydown={isClickable.value && onKeyDown}
        >
          {{
            ...slots,
            prepend: hasPrepend
              ? (slotProps) => {
                  return (
                    <>
                      { props.toggleIcon && (
                        <CListItemAction start={false}>
                          <CBtn
                            density="compact"
                            icon={props.toggleIcon}
                            loading={props.loading}
                            variant="text"
                          >
                            {{
                              loader() {
                                return (
                                  <CProgressCircular
                                    indeterminate="disable-shrink"
                                    size="20"
                                    width="2"
                                  />
                                )
                              },
                            }}
                          </CBtn>
                        </CListItemAction>
                      )}

                      { slots.prepend?.(slotProps) }
                    </>
                  )
                }
              : undefined,
          }}
        </CListItem>
      )
    })

    return {}
  },
})

export type CTreeviewItem = InstanceType<typeof CTreeviewItem>
