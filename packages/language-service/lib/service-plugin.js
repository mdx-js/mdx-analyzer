/**
 * @typedef {import('@volar/language-service').ServicePlugin} ServicePlugin
 * @typedef {import('@volar/language-service').DataTransferItem} DataTransferItem
 */

import path from 'node:path/posix'
import {toMarkdown} from 'mdast-util-to-markdown'
import {fromPlace} from 'unist-util-lsp'
import {URI, Utils} from 'vscode-uri'
import {VirtualMdxFile} from './virtual-file.js'

// https://github.com/microsoft/vscode/blob/1.83.1/extensions/markdown-language-features/src/languageFeatures/copyFiles/shared.ts#L29-L41
const imageExtensions = new Set([
  '.bmp',
  '.gif',
  '.ico',
  '.jpe',
  '.jpeg',
  '.jpg',
  '.png',
  '.psd',
  '.svg',
  '.tga',
  '.tif',
  '.tiff',
  '.webp'
])

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
    name: 'mdx',
    create(context) {
      return {
        async provideDocumentDropEdits(document, position, dataTransfer) {
          const documentUri = URI.parse(document.uri)

          /** @type {DataTransferItem | undefined} */
          let textItem

          /** @type {DataTransferItem | undefined} */
          let uriListItem

          for (const [mime, item] of dataTransfer) {
            if (mime === 'text/plain') {
              textItem = item
              continue
            }

            if (mime === 'text/uri-list') {
              uriListItem = item
              continue
            }

            if (!mime.startsWith('image/')) {
              continue
            }

            const file = item.asFile()
            if (!file) {
              continue
            }

            return {
              insertText: toMarkdown({type: 'image', url: file.name}).trim(),
              insertTextFormat: 1,
              createDataTransferFile: [
                {
                  kind: 'create',
                  uri: String(Utils.joinPath(documentUri, '..', file.name)),
                  contentsMimeType: mime,
                  options: {
                    ignoreIfExists: true
                  }
                }
              ]
            }
          }

          if (uriListItem) {
            const value = await uriListItem.asString()
            const uris = value.split(/\r?\n/)
            /** @type {string[]} */
            const content = []

            for (const line of uris) {
              try {
                const uri = URI.parse(line, true)
                const value =
                  uri.scheme === documentUri.scheme
                    ? path.relative(path.dirname(documentUri.path), uri.path)
                    : line

                content.push(
                  toMarkdown(
                    imageExtensions.has(path.extname(uri.path))
                      ? {type: 'image', url: value}
                      : {type: 'text', value}
                  ).trim()
                )
              } catch {
                continue
              }
            }

            return {
              insertText: content.join(' '),
              insertTextFormat: 1
            }
          }

          if (textItem) {
            const string = await textItem.asString()
            return {
              insertText: string,
              insertTextFormat: 1
            }
          }
        },

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
