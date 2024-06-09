import { mdi } from '@/iconsets/mdi'
import type { Blueprint } from '@/framework'

export const md1: Blueprint = {
  defaults: {
    global: {
      rounded: 'sm',
    },
    CAvatar: {
      rounded: 'circle',
    },
    CAutocomplete: {
      variant: 'underlined',
    },
    CBanner: {
      color: 'primary',
    },
    CBtn: {
      color: 'primary',
      rounded: 0,
    },
    CCheckbox: {
      color: 'secondary',
    },
    CCombobox: {
      variant: 'underlined',
    },
    CSelect: {
      variant: 'underlined',
    },
    CSlider: {
      color: 'primary',
    },
    CTabs: {
      color: 'primary',
    },
    CTextarea: {
      variant: 'underlined',
    },
    CTextField: {
      variant: 'underlined',
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
          'primary': '#3F51B5',
          'primary-darken-1': '#303F9F',
          'primary-lighten-1': '#C5CAE9',
          'secondary': '#FF4081',
          'secondary-darken-1': '#F50057',
          'secondary-lighten-1': '#FF80AB',
          'accent': '#009688',
        },
      },
    },
  },
}
