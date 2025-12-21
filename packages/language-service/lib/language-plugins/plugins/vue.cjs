// @ts-check

/**
 * @typedef {import('@volar/language-core').VirtualCode} VirtualCode
 * @typedef {import('@volar/language-core').LanguagePlugin} LanguagePlugin
 * @typedef {import('@volar/language-core').IScriptSnapshot} IScriptSnapshot
 */

const {
  createVueLanguagePlugin,
  getDefaultCompilerOptions
} = require('@vue/language-core')
const ts = require('typescript')

/**
 * Vue Language Plugin for MDX/React JSX Interoperability
 *
 * This plugin wraps Vue's language service to add JSX-compatible function exports,
 * enabling Vue components to be imported and used in React/MDX contexts.
 *
 * STABILITY APPROACH:
 * Instead of using fragile regex patterns on generated code, this plugin uses
 * Vue's stable public constant `__VLS_export` which is guaranteed by Vue's
 * code generation architecture. The approach leverages:
 *
 * 1. Vue always generates: `export default {} as typeof __VLS_export;`
 * 2. `__VLS_export` is a stable constant defined in Vue's codegen/names.ts
 * 3. We can reliably reference it using the stable constant name
 *
 * This makes the plugin resilient to Vue internal changes.
 */

/**
 * Creates a Volar LanguagePlugin for Vue files with JSX-compatible exports.
 *
 * This wrapper satisfies the `getLanguagePlugin()` interface expected by
 * MDX Analyzer's languagePlugins configuration.
 *
 * @returns {LanguagePlugin}
 */
function getLanguagePlugin() {
  const vueCompilerOptions = getDefaultCompilerOptions()

  /** @type {LanguagePlugin} */
  const basePlugin = createVueLanguagePlugin(
    ts,
    {}, // CompilerOptions - use defaults
    vueCompilerOptions,
    /** @param {string} scriptId */ (scriptId) => scriptId // AsFileName - identity function for string IDs
  )

  // Wrap the plugin to add JSX-compatible exports
  /** @type {LanguagePlugin} */
  const plugin = {
    ...basePlugin,

    typescript: basePlugin.typescript
      ? {
          ...basePlugin.typescript,

          /**
           * Wraps Vue's generated TypeScript service script to add JSX-compatible exports.
           *
           * Vue generates: `export default {} as typeof __VLS_export;`
           * We add: `export default function ComponentName(_props: Props): any {}`
           *
           * This approach is stable because:
           * - __VLS_export is a public constant from Vue's codegen/names.ts
           * - InstanceType<typeof __VLS_export>['$props'] is the standard way to extract props type
           * - This pattern is used throughout Vue's own codebase
           *
           * @param {VirtualCode & { fileName?: string }} rootCode
           */
          getServiceScript(rootCode) {
            const result = basePlugin.typescript?.getServiceScript?.(rootCode)
            if (!result) return result

            const fileName = rootCode.fileName || ''
            const originalSnapshot = result.code.snapshot
            const originalText = originalSnapshot.getText(
              0,
              originalSnapshot.getLength()
            )

            // Extract the component name from the file path
            const baseName =
              fileName
                .split('/')
                .pop()
                ?.replace(/\.vue$/, '') || 'Component'
            const componentName =
              baseName.charAt(0).toUpperCase() + baseName.slice(1)

            // Use Vue's stable __VLS_export constant to get props type
            // This is resilient because __VLS_export is a public API constant
            const jsxExport = `
// JSX-compatible export for MDX/React interoperability
// Uses Vue's stable __VLS_export constant to extract component props type
type __VLS_JSXProps = InstanceType<typeof __VLS_export>['$props'];
export default function ${componentName}(_props: __VLS_JSXProps): any {}
`

            // Append our JSX-compatible export after Vue's generated code
            // This is additive (doesn't modify Vue's output) making it very stable
            const modifiedText = originalText + jsxExport

            return {
              ...result,
              code: {
                ...result.code,
                snapshot: {
                  getText: (
                    /** @type {number} */ start,
                    /** @type {number} */ end
                  ) => modifiedText.slice(start, end),
                  getLength: () => modifiedText.length,
                  getChangeRange: () => undefined
                }
              }
            }
          }
        }
      : undefined
  }

  // Type assertion to work around TypeScript module augmentation issues
  return /** @type {any} */ (plugin)
}

module.exports = {getLanguagePlugin}
