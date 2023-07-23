/**
 * @typedef {import('monaco-editor').worker.IWorkerContext} IWorkerContext
 * @typedef {import('unified').PluggableList} PluggableList
 *
 * @typedef MDXWorkerOptions
 * @property {PluggableList} [plugins]
 *   A list of remark plugins. Only syntax parser plugins are supported. For
 *   example `remark-frontmatter`, but not `remark-mdx-frontmatter`.
 */

import {resolveConfig} from '@mdx-js/language-service'
import {
  createLanguageService,
  createLanguageHost,
  createServiceEnvironment
} from '@volar/monaco/worker.js'
// @ts-expect-error This module is untyped.
import {initialize} from 'monaco-editor/esm/vs/editor/editor.worker.js'
import typescript from 'typescript/lib/tsserverlibrary.js'

/** @type {PluggableList | undefined} */
let plugins

// eslint-disable-next-line unicorn/prefer-add-event-listener
self.onmessage = () => {
  initialize(
    /**
     * @param {IWorkerContext} workerContext
     */
    (workerContext) => {
      const env = createServiceEnvironment()
      const host = createLanguageHost(workerContext.getMirrorModels, env, '/', {
        checkJs: true,
        jsx: typescript.JsxEmit.ReactJSX,
        moduleResolution: typescript.ModuleResolutionKind.NodeJs
      })
      const config = resolveConfig({}, typescript, plugins)

      return createLanguageService({typescript}, env, config, host)
    }
  )
}

/**
 * Configure the Monaco MDX worker.
 *
 * @param {MDXWorkerOptions} options
 *   The options to set.
 */
export function configure(options) {
  plugins = options.plugins
}
