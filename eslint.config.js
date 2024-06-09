import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.github/**/*', '.changeset/**/*', '.husky/**/*'],
  rules: {
    'style/max-statements-per-line': ['error', {
      max: 2,
    }],
    'vue/v-slot-style': ['warn', {
      default: 'longform',
      named: 'longform',
    }],
    'vue/multi-word-component-names': 'off',
    'ts/consistent-type-definitions': 'off',
    'ts/ban-types': 'off',
    'ts/no-redeclare': 'off',
  },
})
