#!/usr/bin/env node
import {createRequire} from 'node:module'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import {build} from 'esbuild'

const require = createRequire(import.meta.url)

const debug = process.argv.includes('debug')

await build({
  bundle: true,
  entryPoints: {
    'out/extension': require.resolve('../src/extension.js'),
    'out/language-server': require.resolve('@mdx-js/language-server'),
    'node_modules/@mdx-js/typescript-plugin': require.resolve(
      '../../typescript-plugin/lib/index.cjs'
    )
  },
  external: ['vscode'],
  logLevel: 'info',
  minify: !debug,
  outdir: fileURLToPath(new URL('../', import.meta.url)),
  platform: 'node',
  sourcemap: debug,
  target: 'node16',
  plugins: [
    {
      name: 'alias',
      setup({onResolve, resolve}) {
        onResolve({filter: /^(jsonc-parser)$/}, ({path, ...options}) =>
          resolve(require.resolve(path).replace(/\/umd\//, '/esm/'), options)
        )
        onResolve({filter: /\/umd\//}, ({path, ...options}) =>
          resolve(path.replace(/\/umd\//, '/esm/'), options)
        )
      }
    }
  ]
})
