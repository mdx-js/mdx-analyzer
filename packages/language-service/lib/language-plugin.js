/// <reference types="@volar/typescript" />

/**
 * @import {Options, Program} from 'acorn'
 * @import {LanguagePlugin} from '@volar/language-service'
 * @import {PluggableList} from 'unified'
 * @import {URI} from 'vscode-uri'
 * @import {VirtualCodePlugin} from './plugins/plugin.js'
 */

import {Parser} from 'acorn'
import acornJsx from 'acorn-jsx'
import {LooseParser} from 'acorn-loose'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'
import {VirtualMdxCode} from './virtual-code.js'

const StrictParser = Parser.extend(acornJsx())

const hybridAcorn = {
  /**
   * Parse ESM strictly, so JSX is supported, and only fall back to
   * `acorn-loose`, which doesn’t support JSX, to recover from invalid code.
   *
   * @param {string} input
   * @param {Options} options
   * @returns {Program}
   */
  parse(input, options) {
    const {onComment, onToken} = options
    const commentCount = Array.isArray(onComment) ? onComment.length : 0
    const tokenCount = Array.isArray(onToken) ? onToken.length : 0

    try {
      return StrictParser.parse(input, options)
    } catch {
      // Drop comments and tokens collected by the failed strict parse.
      if (Array.isArray(onComment)) onComment.length = commentCount
      if (Array.isArray(onToken)) onToken.length = tokenCount
      return LooseParser.parse(input, options)
    }
  },
  parseExpressionAt: StrictParser.parseExpressionAt.bind(StrictParser)
}

/**
 * Create a [Volar](https://volarjs.dev) language plugin to support MDX.
 *
 * @param {PluggableList} [remarkPlugins]
 *   A list of remark syntax plugins. Only syntax plugins are supported.
 *   Transformers are unused.
 * @param {VirtualCodePlugin[]} [virtualCodePlugins]
 * @param {boolean} checkMdx
 *   If true, check MDX files strictly.
 * @param {string} jsxImportSource
 *   The JSX import source to use in the embedded JavaScript file.
 * @returns {LanguagePlugin<string | URI, VirtualMdxCode>}
 *   A Volar language plugin to support MDX.
 */
export function createMdxLanguagePlugin(
  remarkPlugins,
  virtualCodePlugins,
  checkMdx = false,
  jsxImportSource = 'react'
) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx, {acorn: hybridAcorn})
  if (remarkPlugins) {
    processor.use(remarkPlugins)
  }

  processor.freeze()

  return {
    getLanguageId(fileNameOrUri) {
      if (String(fileNameOrUri).endsWith('.mdx')) {
        return 'mdx'
      }
    },

    createVirtualCode(fileNameOrUri, languageId, snapshot) {
      if (languageId === 'mdx') {
        return new VirtualMdxCode(
          snapshot,
          processor,
          virtualCodePlugins || [],
          checkMdx,
          jsxImportSource
        )
      }
    },

    typescript: {
      extraFileExtensions: [
        {extension: 'mdx', isMixedContent: true, scriptKind: 7}
      ],

      getServiceScript(root) {
        if (root.embeddedCodes) {
          return {
            code: root.embeddedCodes[0],
            extension: '.jsx',
            scriptKind: 2
          }
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
