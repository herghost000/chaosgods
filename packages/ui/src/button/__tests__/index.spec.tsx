import { mount } from '@vue/test-utils'
import { Button } from '@chaosgods/ui'

// SECTION button
describe('button', () => {
  // ANCHOR type
  it('type', () => {
    // ANCHOR 找到button按钮
    const wrapper = mount(<Button type="primary">测试</Button>)
    const button = wrapper.find('button')
    // NOTE 然后我们再拿到element的元素，然后我们找到classList我们判断一下是不是包含我们想要的元素
    // NOTE 我们写完后大家可以看到单测通过了，就证明我们的primary的形式下拿到对应的元素了。
    expect(button.element.classList.contains('c-button--primary')).toBe(true)
    // NOTE 测试完成后我们记得要销毁一下元素
    wrapper.unmount()

    const wrapper1 = mount(<Button type="dashed">测试</Button>)
    // 找到button按钮
    const button1 = wrapper1.find('button')
    expect(button1.element.classList.contains('c-button--dashed')).toBe(true)
    wrapper1.unmount()
  })

  // ANCHOR size
  it('size', () => {
    const wrapper = mount(<Button size="small">测试</Button>)
    const button = wrapper.find('button')
    expect(button.element.classList.contains('c-button-size--small')).toBe(true)
    wrapper.unmount()
  })

  // ANCHOR click
  it('click', () => {
    let clickState = false
    const handleClick = () => {
      clickState = true
    }
    const warpper = mount(<Button onClick={handleClick}></Button>)
    // NOTE 我们通过trigger方法中的click来触发一下事件
    warpper.trigger('click')
    // NOTE 我们期望，我么触发了click事件以后clickState变成true
    expect(clickState).toBe(true)
    warpper.unmount()
  })
})
// !SECTION button
