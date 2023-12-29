/**
 * @typedef {import('@volar/language-service').LanguagePlugin<VirtualMdxFile>} LanguagePlugin
 * @typedef {import('unified').PluggableList} PluggableList
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'
import {VirtualMdxFile} from './virtual-file.js'

/**
 * Create a [Volar](https://volarjs.dev) language module to support MDX.
 *
 * @param {PluggableList} [plugins]
 *   A list of remark syntax plugins. Only syntax plugins are supported.
 *   Transformers are unused.
 * @param {string} jsxImportSource
 *   The JSX import source to use in the embedded JavaScript file.
 * @returns {LanguagePlugin}
 *   A Volar language plugin to support MDX.
 */
export function createMdxLanguagePlugin(plugins, jsxImportSource = 'react') {
  const processor = unified().use(remarkParse).use(remarkMdx)
  if (plugins) {
    processor.use(plugins)
  }

  processor.freeze()

  return {
    createVirtualFile(fileName, languageId, snapshot) {
      if (languageId === 'mdx') {
        return new VirtualMdxFile(
          fileName,
          snapshot,
          processor,
          jsxImportSource
        )
      }
    },

    updateVirtualFile(mdxFile, snapshot) {
      mdxFile.update(snapshot)
    },

    typescript: {
      extraFileExtensions: [
        {extension: 'mdx', isMixedContent: true, scriptKind: 7}
      ],

      resolveSourceFileName(tsFileName) {
        if (tsFileName.endsWith('.mdx.jsx')) {
          // .mdx.jsx → .mdx
          return tsFileName.slice(0, -4)
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
