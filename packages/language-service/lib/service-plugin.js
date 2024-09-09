/**
 * @import {DataTransferItem, LanguageServicePlugin, WorkspaceEdit} from '@volar/language-service'
 */

import path from 'node:path/posix'
import {toMarkdown} from 'mdast-util-to-markdown'
import {fromPlace} from 'unist-util-lsp'
import {URI, Utils} from 'vscode-uri'
import {toggleSyntax} from './commands.js'
import {VirtualMdxCode} from './virtual-code.js'

/**
 * @callback ApplyEdit
 * @param {WorkspaceEdit} edit
 *   The workspace edit to apply.
 * @returns {PromiseLike<unknown>}
 */

/**
 * @typedef createMdxServicePlugin.Options
 * @property {ApplyEdit} applyEdit
 *   A function to apply workspace edits.
 */

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
 * The service supports:
 *
 * - Reporting diagnostics for parsing errors.
 * - Document drop support for images.
 * - Custom commands for toggling `delete`, `emphasis`, `inlineCode`, and
 *   `strong` text.
 *
 * @param {createMdxServicePlugin.Options} options
 *   Options to configure the MDX language service.
 * @returns {LanguageServicePlugin}
 *   The Volar service plugin for MDX files.
 */
export function createMdxServicePlugin(options) {
  return {
    name: 'mdx',

    capabilities: {
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      },
      executeCommandProvider: {
        commands: [
          'mdx.toggleDelete',
          'mdx.toggleEmphasis',
          'mdx.toggleInlineCode',
          'mdx.toggleStrong'
        ]
      },
      documentDropEditsProvider: true
    },

    create(context) {
      return {
        executeCommand(command, args) {
          switch (command) {
            case 'mdx.toggleDelete': {
              return toggleSyntax(
                context,
                options,
                'delete',
                '~~',
                args[0],
                args[1]
              )
            }

            case 'mdx.toggleEmphasis': {
              return toggleSyntax(
                context,
                options,
                'emphasis',
                '*',
                args[0],
                args[1]
              )
            }

            case 'mdx.toggleInlineCode': {
              return toggleSyntax(
                context,
                options,
                'inlineCode',
                '`',
                args[0],
                args[1]
              )
            }

            case 'mdx.toggleStrong': {
              return toggleSyntax(
                context,
                options,
                'strong',
                '**',
                args[0],
                args[1]
              )
            }

            default: {
              throw new Error('Unknown command: ' + command)
            }
          }
        },

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

        provideDiagnostics(document) {
          const decoded = context.decodeEmbeddedDocumentUri(
            URI.parse(document.uri)
          )
          const sourceScript =
            decoded && context.language.scripts.get(decoded[0])
          const virtualCode =
            decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1])

          if (!(virtualCode instanceof VirtualMdxCode)) {
            return
          }

          const error = virtualCode.error

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
    }
  }
}
