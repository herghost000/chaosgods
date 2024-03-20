import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Chaos UI',
  description: '面向设计师和开发者',
  rewrites: {
    'docs/(.*)': '(.*)',
    'packages/chaos-ui/src/:component/(.*)': 'components/:component/(.*)',
    'packages/icons/docs/(.*)': 'components/icons/(.*)',
    'packages/utils/src/:path/(.*)': 'utils/:path/(.*)',
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '介绍', link: '/introduce' },
      { text: '组件', link: '/components/' },
      { text: '工具', link: '/utils/' },
    ],

    sidebar: {
      '/components/': [
        {
          text: '基础组件',
          items: [
            // 我们可以在items中添加多个子侧边
            { text: '按钮', link: '/components/button/' },
            { text: '图标', link: '/components/icons/' },
            { text: '文字提示', link: '/components/tooltip/' },
            { text: '表格', link: '/components/table/' },
            { text: '虚拟列表', link: '/components/virtual-list/' },
            { text: '消息提示', link: '/components/notification/' },
          ],
        },
        // 我们还可以可以添加多个分组
        {
          text: '输入组件',
          items: [
            {
              text: 'Input',
              link: '/components/input/',
            },
          ],
        },
      ],
      '/utils/': [
        {
          text: '类名生成器',
          link: '/utils/gen-class/',
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chaos-ui' },
    ],
  },
})