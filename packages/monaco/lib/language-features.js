/**
 * @typedef {import('monaco-editor').editor.IMarkerData} IMarkerData
 * @typedef {import('monaco-editor').editor.IRelatedInformation} IRelatedInformation
 * @typedef {import('monaco-editor').editor.ITextModel} ITextModel
 * @typedef {import('monaco-editor').languages.ILink} ILink
 * @typedef {import('monaco-editor').languages.Location} Location
 * @typedef {import('monaco-editor').IRange} IRange
 * @typedef {import('monaco-editor').IPosition} IPosition
 * @typedef {import('monaco-editor').MarkerSeverity} MarkerSeverity
 * @typedef {import('monaco-editor').MarkerTag} MarkerTag
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
 * @param {string | ts.DiagnosticMessageChain | undefined} diag
 * @param {string} newLine
 * @param {number} [indent]
 * @returns {string} A flattened diagnostic text.
 */
export function flattenDiagnosticMessageText(diag, newLine, indent = 0) {
  if (typeof diag === 'string') {
    return diag
  }
  if (diag === undefined) {
    return ''
  }
  let result = ''
  if (indent) {
    result += newLine

    for (let i = 0; i < indent; i++) {
      result += '  '
    }
  }
  result += diag.messageText
  indent++
  if (diag.next) {
    for (const kid of diag.next) {
      result += flattenDiagnosticMessageText(kid, newLine, indent)
    }
  }
  return result
}

/**
 * @param {ITextModel} model
 * @param {ts.DiagnosticRelatedInformation[]} [relatedInformation]
 * @returns {IRelatedInformation[]}
 */
function convertRelatedInformation(model, relatedInformation) {
  if (!relatedInformation) {
    return []
  }

  /** @type {IRelatedInformation[]} */
  const result = []
  for (const info of relatedInformation) {
    const relatedResource = model
    // if (info.file) {
    //   relatedResource = this._libFiles.getOrCreateModel(info.file.fileName);
    // }

    if (!relatedResource) {
      continue
    }
    const infoStart = info.start || 0
    const infoLength = info.length || 1
    const { lineNumber: startLineNumber, column: startColumn } =
      relatedResource.getPositionAt(infoStart)
    const { lineNumber: endLineNumber, column: endColumn } =
      relatedResource.getPositionAt(infoStart + infoLength)

    result.push({
      resource: relatedResource.uri,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: flattenDiagnosticMessageText(info.messageText, '\n'),
    })
  }
  return result
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {ts.DiagnosticCategory} category
 * @returns {MarkerSeverity}
 */
function tsDiagnosticCategoryToMarkerSeverity(monaco, category) {
  switch (category) {
    case 0:
      return monaco.MarkerSeverity.Warning
    case 1:
      return monaco.MarkerSeverity.Error
    case 2:
      return monaco.MarkerSeverity.Hint
  }
  return monaco.MarkerSeverity.Info
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {ITextModel} model
 * @param {ts.Diagnostic} diag
 * @returns {IMarkerData}
 */
function convertDiagnostics(monaco, model, diag) {
  const diagStart = diag.start || 0
  const diagLength = diag.length || 1
  const { lineNumber: startLineNumber, column: startColumn } =
    model.getPositionAt(diagStart)
  const { lineNumber: endLineNumber, column: endColumn } = model.getPositionAt(
    diagStart + diagLength,
  )

  /** @type {MarkerTag[]} */
  const tags = []
  if (diag.reportsUnnecessary) {
    tags.push(monaco.MarkerTag.Unnecessary)
  }
  if (diag.reportsDeprecated) {
    tags.push(monaco.MarkerTag.Deprecated)
  }

  return {
    severity: tsDiagnosticCategoryToMarkerSeverity(monaco, diag.category),
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
    message: flattenDiagnosticMessageText(diag.messageText, '\n'),
    code: diag.code.toString(),
    tags,
    relatedInformation: convertRelatedInformation(
      model,
      diag.relatedInformation,
    ),
  }
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

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-marker-data-provider').MarkerDataProvider} A reference provider for MDX documents.
 */
export function createMarkerDataProvider(monaco) {
  return {
    owner: 'mdx',

    async provideMarkerData(model) {
      const worker = await getWorker(monaco, model)
      const diagnostics = await worker.getSemanticDiagnostics(String(model.uri))

      if (model.isDisposed()) {
        return
      }

      return diagnostics.map(diagnostic =>
        convertDiagnostics(monaco, model, diagnostic),
      )
    },
  }
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-editor').languages.ReferenceProvider} A reference provider for MDX documents.
 */
export function createReferenceProvider(monaco) {
  return {
    async provideReferences(model, position) {
      const worker = await getWorker(monaco, model)
      const resource = model.uri
      const offset = model.getOffsetAt(position)

      if (model.isDisposed()) {
        return
      }

      const entries = /** @type {ts.ReferenceEntry[] | undefined} */ (
        await worker.getReferencesAtPosition(resource.toString(), offset)
      )

      if (!entries || model.isDisposed()) {
        return
      }

      /** @type {Location[]} */
      const result = []
      for (const entry of entries) {
        const uri = monaco.Uri.parse(entry.fileName)
        const refModel = monaco.editor.getModel(uri)
        if (refModel) {
          result.push({
            uri: refModel.uri,
            range: textSpanToRange(refModel, entry.textSpan),
          })
        }
      }
      return result
    },
  }
}
