/**
 * @typedef {import('monaco-editor').languages.typescript.CompilerOptions} CompilerOptions
 * @typedef {import('monaco-editor').languages.typescript.IExtraLibs} IExtraLibs
 * @typedef {import('monaco-editor').languages.typescript.InlayHintsOptions} InlayHintsOptions
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker & ts.LanguageServiceHost} TypeScriptWorker
 * @typedef {import('monaco-editor').worker.IMirrorModel} IMirrorModel
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

import {
  createMDXLanguageService,
  mdxToJsx,
  toJSXPosition,
  toOriginalPosition,
} from '@mdx-js/language-service'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const remark = unified().use(remarkParse).use(remarkMdx)

/**
 * @param {string} filename
 * @returns {boolean} Whether or not the filename contains MDX.
 */
function isMdx(filename) {
  return filename.endsWith('.mdx')
}

/**
 * @param {TypeScriptWorkerClass} TypeScriptWorker
 * @param {typeof ts} _ts
 * @param {Record<string, string>} _libFileMap
 * @returns {TypeScriptWorkerClass} A custom TypeScript worker which knows how to handle MDX.
 */
function worker(TypeScriptWorker, _ts, _libFileMap) {
  return class MDXTSWorker extends TypeScriptWorker {
    #ctx
    #mdxLanguageService

    /**
     * @param {IWorkerContext} ctx
     * @param {Options} options
     */
    constructor(ctx, options) {
      super(ctx, options)

      this.#ctx = ctx
      this.#mdxLanguageService = createMDXLanguageService({
        ts: ts.createLanguageService(this),
      })
    }

    // Overrides of the ts.LanguageServiceHost implementation

    getCompilationSettings() {
      const compilerOptions = super.getCompilationSettings() || {}
      compilerOptions.allowJs = true
      compilerOptions.jsx ??= ts.JsxEmit.Preserve
      compilerOptions.allowNonTsExtensions = true
      return compilerOptions
    }

    /**
     * @param {string} filename
     * @returns {ts.ScriptKind} XXX
     */
    getScriptKind(filename) {
      if (!isMdx(filename)) {
        return super.getScriptKind?.(filename) ?? ts.ScriptKind.JS
      }

      return ts.ScriptKind.JSX
    }

    /**
     * @param {string} filename
     * @returns {ts.IScriptSnapshot | undefined} XXX
     */
    getScriptSnapshot(filename) {
      if (!isMdx(filename)) {
        return super.getScriptSnapshot(filename)
      }

      const model = this.#getModel(filename)
      if (!model) {
        return
      }
      const text = mdxToJsx(model.getValue(), remark)
      return {
        getText: (start, end) => text.slice(start, end),
        getLength: () => text.length,
        // eslint-disable-next-line unicorn/no-useless-undefined
        getChangeRange: () => undefined,
      }
    }

    // Overrides of TypeScript worker methods.

    /**
     * @param {string} filename
     * @param {number} offset
     * @returns {Promise<readonly ts.ReferenceEntry[] | undefined>} XXX
     */
    async getDefinitionAtPosition(filename, offset) {
      const text = this.#getModel(filename)?.getValue()
      if (!text) {
        return
      }

      let definition = /** @type {readonly ts.ReferenceEntry[] | undefined} */ (
        await super.getDefinitionAtPosition(filename, offset)
      )

      if (!definition?.length) {
        definition = await super.getDefinitionAtPosition(
          filename,
          toJSXPosition(text, offset),
        )
      }

      if (definition) {
        for (const entry of definition) {
          this.#patchContextSpan(filename, text, entry.textSpan)
          if (entry.contextSpan) {
            const contextText = this.#getModel(entry.fileName)?.getValue()

            if (contextText) {
              this.#patchContextSpan(
                entry.fileName,
                contextText,
                entry.contextSpan,
              )
            }
          }
        }
      }

      return definition
    }

    /**
     * @param {string} filename
     * @param {number} offset
     * @returns {Promise<ts.QuickInfo | undefined>} XXX
     */
    async getQuickInfoAtPosition(filename, offset) {
      const text = this.#getModel(filename)?.getValue()
      if (!text) {
        return
      }

      const quickInfo = /** @type {ts.QuickInfo | undefined} */ (
        (await super.getQuickInfoAtPosition(filename, offset)) ||
          (await super.getQuickInfoAtPosition(
            filename,
            toJSXPosition(text, offset),
          ))
      )

      if (quickInfo) {
        this.#patchContextSpan(filename, text, quickInfo.textSpan)
      }

      return quickInfo
    }

    // Internal utilities

    /**
     * @param {string} filename
     * @returns {IMirrorModel | undefined} XXX
     */
    #getModel(filename) {
      for (const model of this.#ctx.getMirrorModels()) {
        if (String(model.uri) === filename) {
          return model
        }
      }
    }

    /**
     * @param {string} filename
     * @param {string} text
     * @param {ts.TextSpan} textSpan
     */
    #patchContextSpan(filename, text, textSpan) {
      if (!isMdx(filename)) {
        return
      }
      textSpan.start = toOriginalPosition(text, textSpan.start)
    }
  }
}

// @ts-expect-error This is missing in the Monaco type definitions.
self.customTSWorkerFactory = worker
