/**
 * @typedef {import('@volar/language-core').LanguagePlugin<VirtualMdxFile>} LanguagePlugin
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
 * @returns {LanguagePlugin}
 *   A Volar language module to support MDX.
 */
export function getLanguageModule(plugins) {
  const processor = unified().use(remarkParse).use(remarkMdx)
  if (plugins) {
    processor.use(plugins)
  }

  processor.freeze()

  return {
    createVirtualFile(fileName, languageId, snapshot) {
      if (languageId === 'mdx') {
        return new VirtualMdxFile(fileName, snapshot, processor)
      }
    },

    updateVirtualFile(mdxFile, snapshot) {
      mdxFile.update(snapshot)
    },

    typescript: {
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
            // Default to the JSX automatic runtime, because that’s what MDX does.
            jsx: 4,
            // Set these defaults to match MDX if the user explicitly sets the classic runtime.
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
            // Set this default to match MDX if the user overrides the import source.
            jsxImportSource: 'react',
            ...host.getCompilationSettings(),
            // Always allow JS for type checking.
            allowJs: true,
            // This internal TypeScript property lets TypeScript load `.mdx` files.
            allowNonTsExtensions: true
          })
        }
      }
    }
  }
}
