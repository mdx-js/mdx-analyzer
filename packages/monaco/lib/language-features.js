/**
 * @typedef {import('vscode-languageserver-types').DocumentLink} DocumentLink
 * @typedef {import('vscode-languageserver-types').LocationLink} LocationLink
 * @typedef {import('vscode-languageserver-types').Position} Position
 * @typedef {import('vscode-languageserver-types').Range} Range
 * @typedef {import('monaco-editor').languages.ILink} ILink
 * @typedef {import('monaco-editor').IRange} IRange
 * @typedef {import('monaco-editor').IPosition} IPosition
 */

/**
 * @typedef {import('monaco-worker-manager').WorkerGetter<import('../mdx.worker.js').MDXWorker>} GetWorker
 */

/**
 * @param {IPosition} position
 * @returns {Position} The position as an LSP position.
 */
function fromPosition(position) {
  return {
    line: position.lineNumber - 1,
    character: position.column - 1,
  }
}

/**
 * @param {Range} range
 * @returns {IRange} The range as a Monaco editor range.
 */
function toRange(range) {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  }
}

/**
 * @param {import('vscode-languageserver-types').LocationLink} locationLink
 * @param {typeof import('monaco-editor').Uri} Uri
 * @param {import('monaco-editor').IRange} range
 * @returns {import('monaco-editor').languages.LocationLink} XXX
 */
function toLocationLink(locationLink, Uri, range) {
  return {
    originSelectionRange: locationLink.originSelectionRange
      ? toRange(locationLink.originSelectionRange)
      : range,
    range: toRange(locationLink.targetRange),
    targetSelectionRange: toRange(locationLink.targetSelectionRange),
    uri: Uri.parse(locationLink.targetUri),
  }
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {GetWorker} getWorker
 * @returns {import('monaco-editor').languages.DefinitionProvider} A link provider for MDX documents.
 */
export function createLinkProvider(monaco, getWorker) {
  return {
    async provideDefinition(model, position) {
      const worker = await getWorker(model.uri)

      const locationLinks = await worker.doLocationLinks(
        String(model.uri),
        fromPosition(position),
      )

      return locationLinks.map(link =>
        toLocationLink(
          link,
          monaco.Uri,
          new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column,
          ),
        ),
      )
    },
  }
}
