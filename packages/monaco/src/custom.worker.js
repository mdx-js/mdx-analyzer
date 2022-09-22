/**
 * @typedef {import('monaco-editor').languages.typescript.CompilerOptions} CompilerOptions
 * @typedef {import('monaco-editor').languages.typescript.IExtraLibs} IExtraLibs
 * @typedef {import('monaco-editor').languages.typescript.InlayHintsOptions} InlayHintsOptions
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker} TypeScriptWorker
 * @typedef {import('monaco-editor').worker.IWorkerContext} IWorkerContext
 * @typedef {object} Options
 * @property {CompilerOptions} compilerOptions XXX
 * @property {string} customWorkerPath XXX
 * @property {IExtraLibs} extraLibs XXX
 * @property {InlayHintsOptions} inlayHintsOptions XXX
 * @typedef {new (ctx: IWorkerContext, options: Options) => TypeScriptWorker} TypeScriptWorkerClass
 */

/**
 * @param {TypeScriptWorkerClass} TypeScriptWorker
 * @param {typeof import('typescript')} _ts
 * @param {Record<string, string>} _libFileMap
 * @returns {TypeScriptWorkerClass} A custom TypeScript worker which knows how to handle MDX.
 */
function worker(TypeScriptWorker, _ts, _libFileMap) {
  return class MDXTSWorker extends TypeScriptWorker {
    /**
     * @param {IWorkerContext} ctx
     * @param {Options} options
     */
    constructor(ctx, options) {
      super(ctx, options)
    }
  }
}

// @ts-expect-error This is missing in the Monaco type definitions.
self.customTSWorkerFactory = worker
