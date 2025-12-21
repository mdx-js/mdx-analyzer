// @ts-check

/**
 * Svelte Language Plugin for Volar/MDX Analyzer
 *
 * This creates a Volar LanguagePlugin that transforms .svelte files to TypeScript
 * using svelte2tsx, enabling type checking and import suggestions in MDX files.
 *
 * STABILITY APPROACH:
 * This plugin leverages Svelte's stable public constants to extract component types:
 *
 * 1. `$$render` - Stable constant (internalHelpers.renderName from svelte2tsx)
 * 2. `$$render()` returns `{props: Props, events: Events, slots: Slots}` - Stable contract
 * 3. We reference `typeof $$render` to extract the return type safely
 *
 * This is MORE RESILIENT than regex matching class names because:
 * - $$render is a public constant, not internal implementation
 * - The return type structure is part of Svelte's public API
 * - We use TypeScript's type system, not string manipulation
 */

const {svelte2tsx} = require('svelte2tsx')

/**
 * @typedef {import('@volar/language-core').CodeMapping} CodeMapping
 * @typedef {import('@volar/language-core').VirtualCode} VirtualCode
 * @typedef {import('@volar/language-core').LanguagePlugin} LanguagePlugin
 * @typedef {import('@volar/language-core').IScriptSnapshot} IScriptSnapshot
 */

/**
 * Creates the embedded TSX virtual code from Svelte source
 * @param {string} code - The Svelte source code
 * @param {string} fileName - The file name
 * @returns {VirtualCode}
 */
function createTsxVirtualCode(code, fileName) {
  const isTsFile = /<script\s[^>]*?lang=["'](?:ts|typescript)["']/i.test(code)

  const result = svelte2tsx(code, {
    filename: fileName,
    isTsFile,
    mode: 'ts'
  })

  // Extract the component name from the file path
  const baseName =
    fileName
      .split('/')
      .pop()
      ?.replace(/\.svelte$/, '') || 'Component'
  const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1)

  // Use Svelte's stable $$render function to extract props type
  // This is resilient because:
  // - $$render is a public constant from svelte2tsx (internalHelpers.renderName)
  // - $$render() returns {props: Props, events: Events, slots: Slots} - stable contract
  // - We use TypeScript's type system to extract the type
  const jsxExport = `
// JSX-compatible export for MDX/React interoperability
// Uses Svelte's stable $$render constant to extract component props type
type __Svelte_JSXProps = ReturnType<typeof $$render>['props'];
export default function ${componentName}(_props: __Svelte_JSXProps): any {}
`

  // Append our JSX-compatible export after Svelte's generated code
  // This is additive (doesn't modify svelte2tsx output) making it stable
  const modifiedCode = result.code + jsxExport

  /** @type {CodeMapping[]} */
  const mappings = []

  // Create mappings from the source map
  if (result.map && result.map.mappings) {
    // For now, create a simple identity mapping for the whole file
    // Full source map support would require parsing the VLQ mappings
    mappings.push({
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [code.length],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: false
      }
    })
  }

  return {
    id: 'tsx',
    languageId: 'typescriptreact',
    snapshot: {
      getText: (start, end) => modifiedCode.slice(start, end),
      getLength: () => modifiedCode.length,
      getChangeRange: () => undefined
    },
    mappings,
    embeddedCodes: []
  }
}

/**
 * Svelte VirtualCode implementation
 * @implements {VirtualCode}
 */
class SvelteVirtualCode {
  id = 'root'
  languageId = 'svelte'
  /** @type {CodeMapping[]} */
  mappings
  /** @type {VirtualCode[]} */
  embeddedCodes
  /** @type {never[]} */
  codegenStacks = []

  /**
   * @param {string} fileName
   * @param {import('typescript').IScriptSnapshot} snapshot
   */
  constructor(fileName, snapshot) {
    const length = snapshot.getLength()
    const code = snapshot.getText(0, length)

    this.fileName = fileName
    this.snapshot = snapshot

    this.mappings = [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [length],
        data: {
          verification: true,
          completion: true,
          semantic: true,
          navigation: true,
          structure: true,
          format: false
        }
      }
    ]

    this.embeddedCodes = []

    try {
      const tsxCode = createTsxVirtualCode(code, fileName)
      this.embeddedCodes.push(tsxCode)
    } catch (error) {
      // If svelte2tsx fails, create an empty embedded code
      console.error(`[Svelte Plugin] Failed to transform ${fileName}:`, error)
    }
  }
}

/**
 * Creates a Volar LanguagePlugin for Svelte files.
 *
 * This wrapper satisfies the `getLanguagePlugin()` interface expected by
 * MDX Analyzer's languagePlugins configuration.
 *
 * @returns {LanguagePlugin}
 */
function getLanguagePlugin() {
  /** @type {LanguagePlugin} */
  const plugin = {
    /**
     * @param {string} fileName
     * @returns {string | undefined}
     */
    getLanguageId(fileName) {
      if (fileName.endsWith('.svelte')) {
        return 'svelte'
      }
    },

    /**
     * @param {string} fileName
     * @param {string} languageId
     * @param {IScriptSnapshot} snapshot
     * @returns {SvelteVirtualCode | undefined}
     */
    createVirtualCode(fileName, languageId, snapshot) {
      if (languageId === 'svelte') {
        return new SvelteVirtualCode(fileName, snapshot)
      }
    },

    typescript: {
      extraFileExtensions: [
        {
          extension: 'svelte',
          isMixedContent: true,
          scriptKind: 7 /* Ts.ScriptKind.Deferred */
        }
      ],

      /**
       * @param {VirtualCode} svelteCode
       * @returns {import('@volar/typescript').TypeScriptServiceScript | undefined}
       */
      getServiceScript(svelteCode) {
        if (svelteCode.embeddedCodes) {
          for (const code of svelteCode.embeddedCodes) {
            if (code.id === 'tsx') {
              return {
                code,
                extension: '.tsx',
                scriptKind: 4 // Ts.ScriptKind.TSX
              }
            }
          }
        }
      }
    }
  }

  // Type assertion to work around TypeScript module augmentation issues
  return /** @type {any} */ (plugin)
}

module.exports = {getLanguagePlugin}
