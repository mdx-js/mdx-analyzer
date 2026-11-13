import {define} from '@remcohaszing/eslint'

export default define([
  {
    ignores: [
      // This file has too many violations, but will be removed soon anyway.
      'packages/language-service/lib/virtual-code.js'
    ]
  },
  {
    rules: {
      'no-use-before-define': 'off',
      'n/hashbang': 'off'
    }
  }
])
