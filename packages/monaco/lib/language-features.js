/**
 * @typedef {import('monaco-editor').languages.ILink} ILink
 * @typedef {import('monaco-editor').languages.Location} Location
 * @typedef {import('monaco-editor').IRange} IRange
 * @typedef {import('monaco-editor').IPosition} IPosition
 */

/**
 * @param {ts.SymbolDisplayPart[] | undefined} displayParts
 * @returns {string} XXX
 */
function displayPartsToString(displayParts) {
  if (displayParts) {
    return displayParts.map(displayPart => displayPart.text).join('')
  }
  return ''
}

/**
 * @param {ts.JSDocTagInfo} tag
 * @returns {string} XXX
 */
function tagToString(tag) {
  let tagLabel = `*@${tag.name}*`
  if (tag.name === 'param' && tag.text) {
    const [paramName, ...rest] = tag.text
    tagLabel += `\`${paramName.text}\``
    if (rest.length > 0) tagLabel += ` — ${rest.map(r => r.text).join(' ')}`
  } else if (Array.isArray(tag.text)) {
    tagLabel += ` — ${tag.text.map(r => r.text).join(' ')}`
  } else if (tag.text) {
    tagLabel += ` — ${tag.text}`
  }
  return tagLabel
}

/**
 * @param {import('monaco-editor').editor.ITextModel} model
 * @param {ts.TextSpan} span
 * @returns {import('monaco-editor').IRange} XXX
 */
function textSpanToRange(model, span) {
  const p1 = model.getPositionAt(span.start)
  const p2 = model.getPositionAt(span.start + span.length)
  const { lineNumber: startLineNumber, column: startColumn } = p1
  const { lineNumber: endLineNumber, column: endColumn } = p2
  return { startLineNumber, startColumn, endLineNumber, endColumn }
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {import('monaco-editor').editor.ITextModel} model
 */
async function getWorker(monaco, model) {
  const worker = await monaco.languages.typescript.getTypeScriptWorker()
  return worker(model.uri)
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-editor').languages.HoverProvider} A hover provider for MDX documents.
 */
export function createHoverProvider(monaco) {
  return {
    async provideHover(model, position) {
      const worker = await getWorker(monaco, model)

      /** @type {ts.QuickInfo | undefined} */
      const info = await worker.getQuickInfoAtPosition(
        String(model.uri),
        model.getOffsetAt(position),
      )

      if (!info) {
        return
      }

      const documentation = displayPartsToString(info.documentation)
      const tags = info.tags
        ? info.tags.map(tag => tagToString(tag)).join('  \n\n')
        : ''
      const contents = displayPartsToString(info.displayParts)

      return {
        range: textSpanToRange(model, info.textSpan),
        contents: [
          {
            value: '```typescript\n' + contents + '\n```\n',
          },
          {
            value: documentation + (tags ? '\n\n' + tags : ''),
          },
        ],
      }
    },
  }
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-editor').languages.DefinitionProvider} A link provider for MDX documents.
 */
export function createDefinitionProvider(monaco) {
  return {
    async provideDefinition(model, position) {
      const worker = await getWorker(monaco, model)

      const offset = model.getOffsetAt(position)
      const entries = /** @type {ts.ReferenceEntry[] | undefined} */ (
        await worker.getDefinitionAtPosition(String(model.uri), offset)
      )
      if (!entries?.length) {
        return
      }

      /** @type {Location[]} */
      const result = []
      for (const entry of entries) {
        const uri = monaco.Uri.parse(entry.fileName)
        const refModel = monaco.editor.getModel(uri)
        if (refModel) {
          result.push({
            uri,
            range: textSpanToRange(model, entry.textSpan),
          })
        }
      }
      return result
    },
  }
}
