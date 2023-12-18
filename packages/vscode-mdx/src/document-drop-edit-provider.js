/**
 * @typedef {import('mdast').RootContent} RootContent
 * @typedef {import('vscode').DocumentDropEditProvider} DocumentDropEditProvider
 * @typedef {import('vscode').DataTransferItem} DataTransferItem
 */

import path from 'node:path/posix'
import {Uri, WorkspaceEdit} from 'vscode'
import {toMarkdown} from 'mdast-util-to-markdown'

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
 * @type {DocumentDropEditProvider}
 */
export const documentDropEditProvider = {
  async provideDocumentDropEdits(document, position, dataTransfer) {
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

      const additionalEdit = new WorkspaceEdit()
      additionalEdit.createFile(Uri.joinPath(document.uri, '..', file.name), {
        contents: file,
        ignoreIfExists: true
      })

      return {
        insertText: toMarkdown({type: 'image', url: file.name}).trim(),
        additionalEdit
      }
    }

    if (uriListItem) {
      const value = await uriListItem.asString()
      const uris = value.split(/\r?\n/)
      /** @type {string[]} */
      const content = []

      for (const line of uris) {
        try {
          const uri = Uri.parse(line, true)
          const value =
            uri.scheme === document.uri.scheme
              ? path.relative(path.dirname(document.uri.path), uri.path)
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
        insertText: content.join(' ')
      }
    }

    if (textItem) {
      const string = await textItem.asString()
      return {insertText: string}
    }

    return {
      insertText: ''
    }
  }
}
