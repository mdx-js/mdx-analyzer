/* global ts */
/**
 * @typedef {import('monaco-editor').languages.typescript.CompilerOptions} CompilerOptions
 * @typedef {import('monaco-editor').languages.typescript.IExtraLibs} IExtraLibs
 * @typedef {import('monaco-editor').languages.typescript.InlayHintsOptions} InlayHintsOptions
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker} TypeScriptWorker
 * @typedef {import('monaco-editor').worker.IWorkerContext} IWorkerContext
 * @typedef {import('typescript').LanguageServiceHost} LanguageServiceHost
 * @typedef {import('unified').PluggableList} PluggableList
 *
 * @typedef {object} CreateData
 * @property {CompilerOptions} compilerOptions
 *   The TypeScript compiler options configured by the user.
 * @property {string} customWorkerPath
 *   The path to a custom worker.
 * @property {IExtraLibs} extraLibs
 *   Additional libraries to load.
 * @property {InlayHintsOptions} inlayHintsOptions
 *   The TypeScript inlay hints options.
 *
 * @typedef {TypeScriptWorker & LanguageServiceHost} MDXWorker
 * @typedef {new (ctx: IWorkerContext, createData: CreateData) => MDXWorker} TypeScriptWorkerClass
 *
 * @typedef MDXWorkerOptions
 * @property {PluggableList} [plugins]
 *   A list of remark plugins. Only syntax parser plugins are supported. For
 *   example `remark-frontmatter`, but not `remark-mdx-frontmatter`.
 */

import {createMdxLanguageService} from '@mdx-js/language-service'
// @ts-expect-error This module is untyped.
import {initialize as initializeWorker} from 'monaco-editor/esm/vs/editor/editor.worker.js'
// @ts-expect-error This module is untyped.
import {create} from 'monaco-editor/esm/vs/language/typescript/ts.worker.js'

/** @type {PluggableList | undefined} */
let plugins

/**
 * @param {TypeScriptWorkerClass} TypeScriptWorker
 * @returns {TypeScriptWorkerClass} A custom TypeScript worker which knows how to handle MDX.
 */
function worker(TypeScriptWorker) {
  return class MDXWorker extends TypeScriptWorker {
    _languageService = createMdxLanguageService(
      // @ts-expect-error This is globally defined in the worker.
      ts,
      this,
      plugins
    )
  }
}

// @ts-expect-error This is missing in the Monaco type definitions.
self.customTSWorkerFactory = worker

// Trick the TypeScript worker into using the `customTSWorkerFactory`
self.importScripts = () => {}

// eslint-disable-next-line unicorn/prefer-add-event-listener
self.onmessage = () => {
  initializeWorker(
    /**
     * @param {IWorkerContext} ctx
     * @param {CreateData} createData
     * @returns {MDXWorker} The MDX TypeScript worker.
     */
    (ctx, createData) => create(ctx, {...createData, customWorkerPath: true})
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
