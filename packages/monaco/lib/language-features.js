/**
 * @typedef {import('monaco-editor')} monaco
 * @typedef {import('monaco-editor').editor.IMarkerData} IMarkerData
 * @typedef {import('monaco-editor').editor.IRelatedInformation} IRelatedInformation
 * @typedef {import('monaco-editor').editor.ITextModel} ITextModel
 * @typedef {import('monaco-editor').languages.typescript.Diagnostic} Diagnostic
 * @typedef {import('monaco-editor').languages.typescript.DiagnosticRelatedInformation} DiagnosticRelatedInformation
 * @typedef {import('monaco-editor').languages.CompletionItemKind} CompletionItemKind
 * @typedef {import('monaco-editor').languages.CompletionItem} CompletionItem
 * @typedef {import('monaco-editor').languages.Location} Location
 * @typedef {import('monaco-editor').MarkerSeverity} MarkerSeverity
 * @typedef {import('monaco-editor').MarkerTag} MarkerTag
 * @typedef {import('monaco-editor').Uri} Uri
 */

/**
 * @param {monaco} monaco
 * @param {ts.ScriptElementKind} kind
 * @returns {CompletionItemKind} The matching Monaco completion item kind.
 */
function convertScriptElementKind(monaco, kind) {
  switch (kind) {
    case 'primitive type':
    case 'keyword':
      return monaco.languages.CompletionItemKind.Keyword
    case 'var':
    case 'local var':
      return monaco.languages.CompletionItemKind.Variable
    case 'property':
    case 'getter':
    case 'setter':
      return monaco.languages.CompletionItemKind.Field
    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index':
      return monaco.languages.CompletionItemKind.Function
    case 'enum':
      return monaco.languages.CompletionItemKind.Enum
    case 'module':
      return monaco.languages.CompletionItemKind.Module
    case 'class':
      return monaco.languages.CompletionItemKind.Class
    case 'interface':
      return monaco.languages.CompletionItemKind.Interface
    case 'warning':
      return monaco.languages.CompletionItemKind.File
  }
  return monaco.languages.CompletionItemKind.Property
}

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
 * @param {ts.CompletionEntryDetails} details
 * @returns {string} XXX
 */
function createDocumentationString(details) {
  let documentationString = displayPartsToString(details.documentation)
  if (details.tags) {
    for (const tag of details.tags) {
      documentationString += `\n\n${tagToString(tag)}`
    }
  }
  return documentationString
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
 * @param {DiagnosticRelatedInformation[]} [relatedInformation]
 * @returns {IRelatedInformation[]} TypeScript diagnostic related information as Monaco related information.
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
    // eslint-disable-next-line unicorn/explicit-length-check
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
 * @returns {MarkerSeverity} TypeScript diagnostic severity as Monaco marker severity.
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
 * @param {Diagnostic} diag
 * @returns {IMarkerData} The TypeScript diagnostic converted to Monaco marker data.
 */
function convertDiagnostics(monaco, model, diag) {
  const diagStart = diag.start || 0
  // eslint-disable-next-line unicorn/explicit-length-check
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
 * @param {Uri} uri
 */
async function getWorker(monaco, uri) {
  const worker = await monaco.languages.typescript.getTypeScriptWorker()
  return worker(uri)
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-editor').languages.CompletionItemProvider} A completion item provider for MDX documents.
 */
export function createCompletionItemProvider(monaco) {
  return {
    async provideCompletionItems(model, position) {
      const worker = await getWorker(monaco, model.uri)
      const offset = model.getOffsetAt(position)
      const wordInfo = model.getWordUntilPosition(position)
      const wordRange = new monaco.Range(
        position.lineNumber,
        wordInfo.startColumn,
        position.lineNumber,
        wordInfo.endColumn,
      )

      if (model.isDisposed()) {
        return
      }

      const info = /** @type {ts.CompletionInfo | undefined} */ (
        await worker.getCompletionsAtPosition(String(model.uri), offset)
      )

      if (!info || model.isDisposed()) {
        return
      }

      const suggestions = info.entries.map(entry => {
        const range = entry.replacementSpan
          ? textSpanToRange(model, entry.replacementSpan)
          : wordRange

        const tags = entry.kindModifiers?.includes('deprecated')
          ? [monaco.languages.CompletionItemTag.Deprecated]
          : []

        return {
          uri: model.uri,
          position,
          offset,
          range,
          label: entry.name,
          insertText: entry.name,
          sortText: entry.sortText,
          kind: convertScriptElementKind(monaco, entry.kind),
          tags,
        }
      })

      return {
        suggestions,
      }
    },

    async resolveCompletionItem(item) {
      const { label, offset, uri } = /** @type {any} */ (item)

      const worker = await getWorker(monaco, uri)

      const details = /** @type {ts.CompletionEntryDetails | undefined} */ (
        await worker.getCompletionEntryDetails(String(uri), offset, label)
      )

      if (!details) {
        return item
      }

      return {
        ...item,
        label: details.name,
        kind: convertScriptElementKind(monaco, details.kind),
        detail: displayPartsToString(details.displayParts),
        documentation: {
          value: createDocumentationString(details),
        },
      }
    },
  }
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @returns {import('monaco-editor').languages.HoverProvider} A hover provider for MDX documents.
 */
export function createHoverProvider(monaco) {
  return {
    async provideHover(model, position) {
      const worker = await getWorker(monaco, model.uri)

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
      const worker = await getWorker(monaco, model.uri)

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
      const worker = await getWorker(monaco, model.uri)
      const uri = String(model.uri)
      const diagnostics = await Promise.all([
        worker.getSemanticDiagnostics(uri),
        worker.getSuggestionDiagnostics(uri),
      ])

      if (model.isDisposed()) {
        return
      }

      return diagnostics
        .flat()
        .map(diagnostic => convertDiagnostics(monaco, model, diagnostic))
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
      const worker = await getWorker(monaco, model.uri)
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
