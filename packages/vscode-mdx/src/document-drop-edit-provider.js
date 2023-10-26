/**
 * @typedef {import('vscode').DocumentDropEditProvider} DocumentDropEditProvider
 * @typedef {import('vscode').DataTransferItem} DataTransferItem
 */

import {Uri, WorkspaceEdit} from 'vscode'

/**
 * @type {DocumentDropEditProvider}
 */
export const documentDropEditProvider = {
  async provideDocumentDropEdits(document, position, dataTransfer) {
    /** @type {DataTransferItem | undefined} */
    let textItem

    for (const [mime, item] of dataTransfer) {
      if (mime === 'text/plain') {
        textItem = item
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
        insertText: '![](' + file.name + ')',
        additionalEdit
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
