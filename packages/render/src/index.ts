export interface EditorProps {
  components: ComponentData[]
  currentElement: string
  //   page: PageData
  copiedComponent?: ComponentData
  histories?: HistoryProps[]
}

export interface ComponentData {
  props: { [key: string]: any }
  id: string
  name: string
  // 图层隐藏
  isHidden?: boolean
  // 图层锁定
  isLocked?: boolean
  // 图层名称
  layerName?: string
}

export interface HistoryProps {
  id: string
  componentId: string
  type: 'add' | 'delete' | 'modity'
  data: any
  index?: number
}

export const testComponents: ComponentData[] = [
  {
    id: '1',
    name: 'Button',
    props: { text: 'click1', fontSize: '20px' },
  },
  {
    id: '2',
    name: 'Button',
    props: { text: 'click2', fontSize: '20px' },
  },
  {
    id: '3',
    name: 'Button',
    props: { text: 'click3', fontSize: '20px' },
  },
]

export const editor: EditorProps = {
  components: testComponents,
  currentElement: '1',
}

export const commonDefaultProps = {
  width: '',
  height: '',
}

export const buttonDefaultProps = {
  ...commonDefaultProps,
  text: '内容',
  fontSize: '14px',
}

// const buttonStylePropsNames = witout(Object.keys(buttonDefaultProps), 'url')
// export const transform2ComponentProps = <T extends {[key: string]: any}>(props: T) {
//     return mapValues(props, (item) => {
//         return {
//             type: item.constructor,
//             default: item
//         }
//     })
// }

// <component
//      v-for="component in components"
//     :key="component.id"
//     :is="component.name"
//     v-bind="props">
// </component>
// <template>
//     <component :is="tag" :style="styleProps" @click="handleClick">{{text}}</component>
// </template>
// const defaultProps = transform2ComponentProps(buttonDefaultProps)
// export default defineComponent({
//   name: 'Button',
//   props: {
//     tag: 'div',
//     ...defaultProps
//   },
//   setup(props) {
//     const styleProps = computed(() => {
//       return pick(props, buttonStylePropsNames)
//     })
//     return {
//       styleProps,
//     }
//   },
// })
// const useComponentCommon = <T extends {[key: string]: any}>(props: T, picks: string[]) {
//     const styleProps = computed(() => {
//       return pick(props, picks)
//     })
//     const handleClick = () => {
//         if (props.actionType === 'url' && props.url) {
//             window.location.href = props.url
//         }
//     }
//     return {
//         styleProps,
//         handleClick
//     }
// }

export interface PropToForm {
  component: string
  subComponent?: string
  value?: string
  extraProps?: { [key: string]: any }
  options?: { text: string, value: any }[]
  initialTransform?: (value: any) => any
  afterTransform?: (value: any) => any
  valueProp?: string
  eventName?: string
  events?: { [key: string]: (e: any) => any }
}

export type PropsToForm = {
  [P in keyof Partial<typeof buttonDefaultProps>]: PropToForm
}

export const mapPropsToForms: PropsToForm = {
  text: {
    component: 'input',
    value: 'click1',
  },
}

// <template>
//     <div class="props-table">
//         <div v-for="(value, key) in finalProps" :key="key" class="prop-item">
//             <component v-if="value" :is="value.component" :[value.valueProp]="value.value" v-bind="value.extraProps" v-on="value.events"></component>
//         </div>
//     </div>
// </template>
// defineComponent({
//     props: {
//         props: {
//             type: Object as PropType<typeof buttonDefaultProps>
//         }
//     },
//     setup(props) {
//         const finalProps = computed(() => {
//             return reduce(props.props, (result, value, key) => {
//                 const newkey = key as keyof typeof buttonDefaultProps
//                 const item = mapPropsToForms[newkey]
//                 if (item) {
//                     item.value = item.initialTransform ? item.initialTransform(value) : value
//                     item.valueProp = item.valueProp ? item.valueProp : 'value'
//                     item.events = {
//                         [item.eventName]: (e: any) => {
//                              context.emit('change', {key, value, item.afterTransform ? item.afterTransform(e) : e})
//                         }
//                     }
//                     result[newkey] = item
//                 }
//                 return result
//             }, {} as PropsToForm)
//         })
//     }
// })
