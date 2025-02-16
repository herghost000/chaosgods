import { computed } from 'vue'
import { makeLineProps } from './util/line'
import { genericComponent, getPropertyFromItem, getUid, propsFactory, useRender } from '@/util'

export type CBarlineSlots = {
  default: void
  label: { index: number, value: string }
}

export type SparklineItem = number | { value: number }

export type SparklineText = {
  x: number
  value: string
}

export interface Boundary {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface Bar {
  x: number
  y: number
  height: number
  value: number
}

export const makeCBarlineProps = propsFactory({
  autoLineWidth: Boolean,

  ...makeLineProps(),
}, 'CBarline')

export const CBarline = genericComponent<CBarlineSlots>()({
  name: 'CBarline',

  props: makeCBarlineProps(),

  setup(props, { slots }) {
    const uid = getUid()
    const id = computed(() => props.id || `barline-${uid}`)
    const autoDrawDuration = computed(() => Number(props.autoDrawDuration) || 500)

    const hasLabels = computed(() => {
      return Boolean(
        props.showLabels
        || props.labels.length > 0
        || !!slots?.label,
      )
    })

    const lineWidth = computed(() => Number.parseFloat(`${props.lineWidth}`) || 4)

    const totalWidth = computed(() => Math.max(props.modelValue.length * lineWidth.value, Number(props.width)))

    const boundary = computed<Boundary>(() => {
      return {
        minX: 0,
        maxX: totalWidth.value,
        minY: 0,
        maxY: Number.parseInt(`${props.height}`, 10),
      }
    })
    const items = computed(() => props.modelValue.map(item => getPropertyFromItem(item, props.itemValue, item)))

    function genBars(
      values: number[],
      boundary: Boundary,
    ): Bar[] {
      const { minX, maxX, minY, maxY } = boundary
      const totalValues = values.length
      let maxValue = props.max != null ? Number(props.max) : Math.max(...values)
      let minValue = props.min != null ? Number(props.min) : Math.min(...values)

      if (minValue > 0 && props.min == null)
        minValue = 0
      if (maxValue < 0 && props.max == null)
        maxValue = 0

      const gridX = maxX / totalValues
      const gridY = (maxY - minY) / ((maxValue - minValue) || 1)
      const horizonY = maxY - Math.abs(minValue * gridY)

      return values.map((value, index) => {
        const height = Math.abs(gridY * value)

        return {
          x: minX + index * gridX,
          y: horizonY - height
          + +(value < 0) * height,
          height,
          value,
        }
      })
    }

    const parsedLabels = computed(() => {
      const labels = []
      const points = genBars(items.value, boundary.value)
      const len = points.length

      for (let i = 0; labels.length < len; i++) {
        const item = points[i]
        let value = props.labels[i]

        if (!value) {
          value = typeof item === 'object'
            ? item.value
            : item
        }

        labels.push({
          x: item.x,
          value: String(value),
        })
      }

      return labels
    })

    const bars = computed(() => genBars(items.value, boundary.value))
    const offsetX = computed(() => (Math.abs(bars.value[0].x - bars.value[1].x) - lineWidth.value) / 2)

    useRender(() => {
      const gradientData = !props.gradient.slice().length ? [''] : props.gradient.slice().reverse()
      return (
        <svg
          display="block"
        >
          <defs>
            <linearGradient
              id={id.value}
              gradientUnits="userSpaceOnUse"
              x1={props.gradientDirection === 'left' ? '100%' : '0'}
              y1={props.gradientDirection === 'top' ? '100%' : '0'}
              x2={props.gradientDirection === 'right' ? '100%' : '0'}
              y2={props.gradientDirection === 'bottom' ? '100%' : '0'}
            >
              {
                gradientData.map((color, index) => (
                  <stop offset={index / (Math.max(gradientData.length - 1, 1))} stop-color={color || 'currentColor'} />
                ))
              }
            </linearGradient>
          </defs>

          <clipPath id={`${id.value}-clip`}>
            {
              bars.value.map(item => (
                <rect
                  x={item.x + offsetX.value}
                  y={item.y}
                  width={lineWidth.value}
                  height={item.height}
                  rx={typeof props.smooth === 'number' ? props.smooth : props.smooth ? 2 : 0}
                  ry={typeof props.smooth === 'number' ? props.smooth : props.smooth ? 2 : 0}
                >
                  { props.autoDraw && (
                    <>
                      <animate
                        attributeName="y"
                        from={item.y + item.height}
                        to={item.y}
                        dur={`${autoDrawDuration.value}ms`}
                        fill="freeze"
                      />
                      <animate
                        attributeName="height"
                        from="0"
                        to={item.height}
                        dur={`${autoDrawDuration.value}ms`}
                        fill="freeze"
                      />
                    </>
                  )}
                </rect>
              ))
            }
          </clipPath>

          { hasLabels.value && (
            <g
              key="labels"
              style={{
                textAnchor: 'middle',
                dominantBaseline: 'mathematical',
                fill: 'currentColor',
              }}
            >
              {
                parsedLabels.value.map((item, i) => (
                  <text
                    x={item.x + offsetX.value + lineWidth.value / 2}
                    y={(Number.parseInt(`${props.height}`, 10) - 2) + (Number.parseInt(`${props.labelSize}`, 10) || 7 * 0.75)}
                    font-size={Number(props.labelSize) || 7}
                  >
                    { slots.label?.({ index: i, value: item.value }) ?? item.value }
                  </text>
                ))
              }
            </g>
          )}

          <g
            clip-path={`url(#${id.value}-clip)`}
            fill={`url(#${id.value})`}
          >
            <rect
              x={0}
              y={0}
              width={Math.max(props.modelValue.length * lineWidth.value, Number(props.width))}
              height={props.height}
            >
            </rect>
          </g>
        </svg>
      )
    })
  },
})

export type CBarline = InstanceType<typeof CBarline>
