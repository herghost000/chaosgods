import { computed, provide, ref, toRef, watch } from 'vue'
import { CTreeviewChildren, makeCTreeviewChildrenProps } from './CTreeviewChildren'
import { CTreeviewSymbol } from './shared'
import { CList, makeCListProps, useListItems } from '@/components/CList/CList'
import { provideDefaults } from '@/composables/defaults'
import { makeFilterProps, useFilter } from '@/composables/filter'
import { useProxiedModel } from '@/composables/proxiedModel'
import { genericComponent, omit, propsFactory, useRender } from '@/util'
import type { CListChildrenSlots } from '@/components/CList/CListChildren'
import type { ListItem } from '@/composables/list-items'
import type { GenericProps } from '@/util'

function flatten(items: ListItem[], flat: ListItem[] = []) {
  for (const item of items) {
    flat.push(item)
    if (item.children)
      flatten(item.children, flat)
  }
  return flat
}

export const makeCTreeviewProps = propsFactory({
  openAll: Boolean,
  search: String,

  ...makeFilterProps({ filterKeys: ['title'] }),
  ...makeCTreeviewChildrenProps(),
  ...omit(makeCListProps({
    collapseIcon: '$treeviewCollapse',
    expandIcon: '$treeviewExpand',
    selectStrategy: 'independent' as const,
    openStrategy: 'multiple' as const,
    slim: true,
  }), ['nav']),
}, 'CTreeview')

export const CTreeview = genericComponent<new<T>(
  props: {
    items?: T[]
  },
  slots: CListChildrenSlots<T>
) => GenericProps<typeof props, typeof slots>>()({
  name: 'CTreeview',

  props: makeCTreeviewProps(),

  emits: {
    'update:opened': (_val: unknown) => true,
    'update:activated': (_val: unknown) => true,
    'update:selected': (_val: unknown) => true,
    'click:open': (_value: { id: unknown, value: boolean, path: unknown[] }) => true,
    'click:select': (_value: { id: unknown, value: boolean, path: unknown[] }) => true,
  },

  setup(props, { slots }) {
    const { items } = useListItems(props)
    const activeColor = toRef(props, 'activeColor')
    const baseColor = toRef(props, 'baseColor')
    const color = toRef(props, 'color')
    const opened = useProxiedModel(props, 'opened')
    const activated = useProxiedModel(props, 'activated')
    const selected = useProxiedModel(props, 'selected')

    const vListRef = ref<CList>()

    const flatItems = computed(() => flatten(items.value))
    const search = toRef(props, 'search')
    const { filteredItems } = useFilter(props, flatItems, search)
    const visibleIds = computed(() => {
      if (!search.value)
        return null

      return new Set(filteredItems.value.flatMap((item) => {
        return [...getPath(item.props.value), ...getChildren(item.props.value)]
      }))
    })

    function getPath(id: unknown) {
      const path: unknown[] = []
      let parent: unknown = id
      while (parent != null) {
        path.unshift(parent)
        parent = vListRef.value?.parents.get(parent)
      }
      return path
    }

    function getChildren(id: unknown) {
      const arr: unknown[] = []
      const queue = ((vListRef.value?.children.get(id) ?? []).slice())
      while (queue.length) {
        const child = queue.shift()
        if (!child)
          continue
        arr.push(child)
        queue.push(...((vListRef.value?.children.get(child) ?? []).slice()))
      }
      return arr
    }

    watch(() => props.openAll, (val) => {
      opened.value = val ? openAll(items.value) : []
    }, { immediate: true })

    function openAll(item: any) {
      let ids: number[] = []

      for (const i of item) {
        if (!i.children)
          continue

        ids.push(i.value)

        if (i.children)
          ids = ids.concat(openAll(i.children))
      }

      return ids
    }

    provide(CTreeviewSymbol, { visibleIds })

    provideDefaults({
      CTreeviewGroup: {
        activeColor,
        baseColor,
        color,
        collapseIcon: toRef(props, 'collapseIcon'),
        expandIcon: toRef(props, 'expandIcon'),
      },
      CTreeviewItem: {
        activeClass: toRef(props, 'activeClass'),
        activeColor,
        baseColor,
        color,
        density: toRef(props, 'density'),
        disabled: toRef(props, 'disabled'),
        lines: toRef(props, 'lines'),
        variant: toRef(props, 'variant'),
      },
    })

    useRender(() => {
      const listProps = CList.filterProps(props)
      const treeviewChildrenProps = CTreeviewChildren.filterProps(props)

      return (
        <CList
          ref={vListRef}
          {...listProps}
          class={[
            'v-treeview',
            props.class,
          ]}
          style={props.style}
          v-model:opened={opened.value}
          v-model:activated={activated.value}
          v-model:selected={selected.value}
        >
          <CTreeviewChildren
            {...treeviewChildrenProps}
            items={items.value}
            v-slots={slots}
          >
          </CTreeviewChildren>
        </CList>
      )
    })

    return {
      open,
    }
  },
})

export type CTreeview = InstanceType<typeof CTreeview>
