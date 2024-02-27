/**
 * @typedef {import('@volar/language-service').LanguagePlugin<VirtualMdxCode>} LanguagePlugin
 * @typedef {import('unified').PluggableList} PluggableList
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'
import {VirtualMdxCode} from './virtual-code.js'

/**
 * Create a [Volar](https://volarjs.dev) language plugin to support MDX.
 *
 * @param {PluggableList} [plugins]
 *   A list of remark syntax plugins. Only syntax plugins are supported.
 *   Transformers are unused.
 * @param {boolean} checkMdx
 *   If true, check MDX files strictly.
 * @param {string} jsxImportSource
 *   The JSX import source to use in the embedded JavaScript file.
 * @returns {LanguagePlugin}
 *   A Volar language plugin to support MDX.
 */
export function createMdxLanguagePlugin(
  plugins,
  checkMdx = false,
  jsxImportSource = 'react'
) {
  const processor = unified().use(remarkParse).use(remarkMdx)
  if (plugins) {
    processor.use(plugins)
  }

  processor.freeze()

  return {
    createVirtualCode(fileId, languageId, snapshot) {
      if (languageId === 'mdx') {
        return new VirtualMdxCode(
          snapshot,
          processor,
          checkMdx,
          jsxImportSource
        )
      }
    },

    updateVirtualCode(fileId, virtualCode, snapshot) {
      virtualCode.update(snapshot)
      return virtualCode
    },

    typescript: {
      extraFileExtensions: [
        {extension: 'mdx', isMixedContent: true, scriptKind: 7}
      ],

      getScript(rootVirtualCode) {
        return {
          code: rootVirtualCode.embeddedCodes[0],
          extension: '.jsx',
          scriptKind: 2
        }
      },

      resolveLanguageServiceHost(host) {
        return {
          ...host,
          getCompilationSettings: () => ({
            ...host.getCompilationSettings(),
            // Always allow JS for type checking.
            allowJs: true
          })
        }
      }
    }
  }
}
