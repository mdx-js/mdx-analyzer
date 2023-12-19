/**
 * @typedef {import('@volar/language-service').ServicePlugin} ServicePlugin
 */

import {fromPlace} from 'unist-util-lsp'
import {VirtualMdxFile} from './virtual-file.js'

/**
 * Create an Volar service plugin for MDX files.
 *
 * The service supports reporting diagnostics for parsing errors.
 *
 * @returns {ServicePlugin}
 *   The Volar service plugin for MDX files.
 */
export function createMdxServicePlugin() {
  return {
    create(context) {
      return {
        provideSemanticDiagnostics(document) {
          const file = getVirtualMdxFile(document.uri)

          const error = file?.error

          if (error) {
            return [
              {
                message: error.message,
                code: error.source
                  ? error.source + ':' + error.ruleId
                  : error.ruleId,
                codeDescription: {
                  href:
                    error.url || 'https://mdxjs.com/docs/troubleshooting-mdx/'
                },
                range: error.place
                  ? fromPlace(error.place)
                  : {
                      start: {line: 0, character: 0},
                      end: {line: 0, character: 0}
                    },
                severity: 1,
                source: 'MDX'
              }
            ]
          }
        }
      }

      /**
       * Get the virtual MDX file that matches a document uri.
       *
       * @param {string} uri
       *   The uri of which to find the matching virtual MDX file.
       * @returns {VirtualMdxFile | undefined}
       *   The matching virtual MDX file, if it exists. Otherwise undefined.
       */
      function getVirtualMdxFile(uri) {
        const [file] = context.language.files.getVirtualFile(
          context.env.uriToFileName(uri)
        )

        if (file instanceof VirtualMdxFile) {
          return file
        }
      }
    }
  }
}
