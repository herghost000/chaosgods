import { mdi } from '@/iconsets/mdi'
import type { Blueprint } from '@/framework'

export const md3: Blueprint = {
  defaults: {
    VAppBar: {
      flat: true,
    },
    CAutocomplete: {
      variant: 'filled',
    },
    CBanner: {
      color: 'primary',
    },
    CBottomSheet: {
      contentClass: 'rounded-t-xl overflow-hidden',
    },
    CBtn: {
      color: 'primary',
      rounded: 'xl',
    },
    CBtnGroup: {
      rounded: 'xl',
      CBtn: { rounded: null },
    },
    CCard: {
      rounded: 'lg',
    },
    CCheckbox: {
      color: 'secondary',
      inset: true,
    },
    CChip: {
      rounded: 'sm',
    },
    CCombobox: {
      variant: 'filled',
    },
    CNavigationDrawer: {
      // CList: {
      //   nav: true,
      //   CListItem: {
      //     rounded: 'xl',
      //   },
      // },
    },
    CSelect: {
      variant: 'filled',
    },
    CSlider: {
      color: 'primary',
    },
    CTabs: {
      color: 'primary',
    },
    CTextarea: {
      variant: 'filled',
    },
    CTextField: {
      variant: 'filled',
    },
    CToolbar: {
      CBtn: {
        color: null,
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#6750a4',
          secondary: '#b4b0bb',
          tertiary: '#7d5260',
          error: '#b3261e',
          surface: '#fffbfe',
        },
      },
    },
  },
}
