#!/usr/bin/env node
import {createRequire} from 'node:module'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import {build} from 'esbuild'

const require = createRequire(import.meta.url)

const debug = process.argv.includes('debug')

build({
  bundle: true,
  entryPoints: {
    extension: require.resolve('../src/extension.js'),
    'language-server': require.resolve('@mdx-js/language-server')
  },
  external: ['vscode'],
  logLevel: 'info',
  minify: !debug,
  outdir: fileURLToPath(new URL('../out/', import.meta.url)),
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

build({
  bundle: true,
  entryPoints: ['./src/typescript-plugin.js'],
  outfile: './node_modules/typescript-plugin-bundled/index.js',
  logLevel: 'info',
  minify: !debug,
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
