import './CPullToRefresh.sass'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { CIcon } from '@/components/CIcon'
import { CProgressCircular } from '@/components/CProgressCircular'
import { clamp, convertToUnit, genericComponent, getScrollParents, useRender } from '@/util'

export type CPullToRefreshSlots = {
  default: never
  pullDownPanel: {
    canRefresh: boolean
    goingUp: boolean
    refreshing: boolean
  }
}

export const CPullToRefresh = genericComponent<CPullToRefreshSlots>()({
  name: 'CPullToRefresh',

  props: {
    pullDownThreshold: {
      type: Number,
      default: 64,
    },
  },

  emits: {
    load: (_options: { done: () => void }) => true,
  },

  setup(props, { slots, emit }) {
    let touchstartY = 0
    let scrollParents: HTMLElement[] = []

    const touchDiff = shallowRef(0)
    const containerRef = ref<HTMLElement>()

    const refreshing = shallowRef(false)
    const goingUp = shallowRef(false)
    const touching = shallowRef(false)

    const canRefresh = computed(() => touchDiff.value >= props.pullDownThreshold && !refreshing.value)
    const topOffset = computed(() => clamp(touchDiff.value, 0, props.pullDownThreshold))

    function onTouchstart(e: TouchEvent | MouseEvent) {
      if (refreshing.value)
        return
      touching.value = true
      touchstartY = 'clientY' in e ? e.clientY : e.touches[0].clientY
    }

    function onTouchmove(e: TouchEvent | MouseEvent) {
      if (refreshing.value || !touching.value)
        return

      const touchY = 'clientY' in e ? e.clientY : e.touches[0].clientY

      if (scrollParents.length && !scrollParents[0].scrollTop)
        touchDiff.value = touchY - touchstartY
    }

    function onTouchend(_e: TouchEvent | MouseEvent) {
      if (refreshing.value)
        return
      touching.value = false
      if (canRefresh.value) {
        function done() {
          if (!refreshing.value)
            return
          touchDiff.value = 0
          refreshing.value = false
        }
        emit('load', { done })
        refreshing.value = true
      }
      else {
        touchDiff.value = 0
      }
    }

    onMounted(() => {
      scrollParents = getScrollParents(containerRef.value)
    })

    watch([topOffset, refreshing], () => {
      if (scrollParents.length) {
        const stopScrolling = topOffset.value && !refreshing.value
        scrollParents.forEach(p => p.style.overflow = stopScrolling ? 'hidden' : 'auto')
      }
    })

    watch(topOffset, (newVal, oldVal) => {
      goingUp.value = newVal < oldVal
    })

    useRender(() => {
      return (
        <div
          class={[
            'v-pull-to-refresh',
          ]}
          onTouchstart={onTouchstart}
          onTouchmove={onTouchmove}
          onTouchend={onTouchend}
          onMousedown={onTouchstart}
          onMouseup={onTouchend}
          onMouseleave={onTouchend}
          onMousemove={onTouchmove}
          ref={containerRef}
        >
          <div
            class={[
              'v-pull-to-refresh__pull-down',
              {
                'v-pull-to-refresh__pull-down--touching': touching.value,
              },
            ]}
            style={{
              top: convertToUnit(-1 * props.pullDownThreshold + topOffset.value),
              height: convertToUnit(props.pullDownThreshold),
            }}
          >
            { slots.pullDownPanel
              ? slots.pullDownPanel({
                canRefresh: canRefresh.value,
                goingUp: goingUp.value,
                refreshing: refreshing.value,
              })
              : (
                <div
                  class={[
                    'v-pull-to-refresh__pull-down-default',
                  ]}
                >
                  {
                    refreshing.value
                      ? (
                        <CProgressCircular
                          indeterminate
                          active={false}
                        />
                        )
                      : (
                        <CIcon
                          icon={canRefresh.value || goingUp.value ? '$sortAsc' : '$sortDesc'}
                        />
                        )
                  }
                </div>
                )}
          </div>
          <div
            class={[
              'v-pull-to-refresh__scroll-container',
              {
                'v-pull-to-refresh__scroll-container--touching': touching.value,
              },
            ]}
            style={{ top: convertToUnit(topOffset.value) }}
          >
            { slots.default?.() }
          </div>
        </div>
      )
    })
  },
})

export type CPullToRefresh = InstanceType<typeof CPullToRefresh>
