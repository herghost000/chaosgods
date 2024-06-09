import { mdi } from '@/iconsets/mdi'
import type { Blueprint } from '@/framework'

export const md2: Blueprint = {
  defaults: {
    global: {
      rounded: 'md',
    },
    CAvatar: {
      rounded: 'circle',
    },
    CAutocomplete: {
      variant: 'filled',
    },
    CBanner: {
      color: 'primary',
    },
    CBtn: {
      color: 'primary',
    },
    CCheckbox: {
      color: 'secondary',
    },
    CCombobox: {
      variant: 'filled',
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
          'primary': '#6200EE',
          'primary-darken-1': '#3700B3',
          'secondary': '#03DAC6',
          'secondary-darken-1': '#018786',
          'error': '#B00020',
        },
      },
    },
  },
}
