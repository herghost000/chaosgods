import process from 'node:process'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.NODE_ENV === 'production' && process.env.BUILD_VERCEL === undefined ? '/chaosgods/' : '/',
  title: 'CHAOS DOCS',
  description: '面向设计师和开发者',
  rewrites: {
    'docs/(.*)': '(.*)',
    'packages/ui/src/:component/(.*)': 'components/:component/(.*)',
    'packages/icons/docs/(.*)': 'components/icons/(.*)',
    'packages/utils/src/:path/(.*)': 'utils/:path/(.*)',
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
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
            { text: 'button', link: '/components/button/' },
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
      { icon: 'github', link: 'https://github.com/herghost000/chaosgods' },
    ],
  },
})
