import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'decode-named-character-reference': fileURLToPath(
        new URL(
          '../../node_modules/decode-named-character-reference/index.js',
          import.meta.url,
        ),
      ),
    },
  },
})
