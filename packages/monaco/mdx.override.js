/**
 * @typedef {import('monaco-editor').languages.typescript.CompilerOptions} CompilerOptions
 * @typedef {import('monaco-editor').languages.typescript.IExtraLibs} IExtraLibs
 * @typedef {import('monaco-editor').languages.typescript.InlayHintsOptions} InlayHintsOptions
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker & ts.LanguageServiceHost} TypeScriptWorker
 * @typedef {import('monaco-editor').worker.IWorkerContext} IWorkerContext
 */

/**
 * @typedef {object} Options
 * @property {CompilerOptions} compilerOptions The TypeScript compiler options configured by the user.
 * @property {string} customWorkerPath The path to a custom worker.
 * @property {IExtraLibs} extraLibs Additional libraries to load.
 * @property {InlayHintsOptions} inlayHintsOptions The TypeScript inlay hints options.
 */

/**
 * @typedef {new (ctx: IWorkerContext, options: Options) => TypeScriptWorker} TypeScriptWorkerClass
 */

import { createMDXLanguageService } from '@mdx-js/language-service'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const remark = unified().use(remarkParse).use(remarkMdx)

/**
 * @param {TypeScriptWorkerClass} TypeScriptWorker
 * @returns {TypeScriptWorkerClass} A custom TypeScript worker which knows how to handle MDX.
 */
function worker(TypeScriptWorker) {
  return class MDXWorker extends TypeScriptWorker {
    _languageService = createMDXLanguageService(ts, this, remark)
  }
}

// @ts-expect-error This is missing in the Monaco type definitions.
self.customTSWorkerFactory = worker
