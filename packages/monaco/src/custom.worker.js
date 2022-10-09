/**
 * @typedef {import('monaco-editor').languages.typescript.CompilerOptions} CompilerOptions
 * @typedef {import('monaco-editor').languages.typescript.IExtraLibs} IExtraLibs
 * @typedef {import('monaco-editor').languages.typescript.InlayHintsOptions} InlayHintsOptions
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker & ts.LanguageServiceHost} TypeScriptWorker
 * @typedef {import('monaco-editor').worker.IWorkerContext} IWorkerContext
 */

/**
 * @typedef {object} Options
 * @property {CompilerOptions} compilerOptions XXX
 * @property {string} customWorkerPath XXX
 * @property {IExtraLibs} extraLibs XXX
 * @property {InlayHintsOptions} inlayHintsOptions XXX
 */

/**
 * @typedef {new (ctx: IWorkerContext, options: Options) => TypeScriptWorker} TypeScriptWorkerClass
 */

import { createMDXLanguageService } from '@mdx-js/language-service'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

self.addEventListener('message', event => {
  if (Array.isArray(event.data.args)) {
    console.log(...event.data.args)
  }
})

const remark = unified().use(remarkParse).use(remarkMdx)

/**
 * @param {TypeScriptWorkerClass} TypeScriptWorker
 * @param {typeof ts} _ts
 * @param {Record<string, string>} _libFileMap
 * @returns {TypeScriptWorkerClass} A custom TypeScript worker which knows how to handle MDX.
 */
function worker(TypeScriptWorker, _ts, _libFileMap) {
  return class MDXWorker extends TypeScriptWorker {
    _languageService = createMDXLanguageService(ts, this, remark)
  }
}

// @ts-expect-error This is missing in the Monaco type definitions.
self.customTSWorkerFactory = worker
