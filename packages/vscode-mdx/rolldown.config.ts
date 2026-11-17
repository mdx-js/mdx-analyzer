import {defineConfig} from 'rolldown'

export default defineConfig({
  external: 'vscode',
  platform: 'node',
  output: {
    cleanDir: true,
    minify: true
  },
  input: {
    'mdx-language-server': '@mdx-js/language-server',
    extension: './src/extension.js'
  }
})
