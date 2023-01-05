/**
 * @typedef {import('monaco-editor')} Monaco
 * @typedef {import('monaco-editor').editor.IMarkerData} IMarkerData
 * @typedef {import('monaco-editor').editor.IRelatedInformation} IRelatedInformation
 * @typedef {import('monaco-editor').editor.ITextModel} ITextModel
 * @typedef {import('monaco-editor').languages.typescript.Diagnostic} Diagnostic
 * @typedef {import('monaco-editor').languages.typescript.DiagnosticRelatedInformation} DiagnosticRelatedInformation
 * @typedef {import('monaco-editor').languages.CompletionItemKind} CompletionItemKind
 * @typedef {import('monaco-editor').IRange} IRange
 * @typedef {import('monaco-editor').MarkerSeverity} MarkerSeverity
 * @typedef {import('monaco-editor').MarkerTag} MarkerTag
 * @typedef {import('typescript').CompletionEntryDetails} CompletionEntryDetails
 * @typedef {import('typescript').DiagnosticCategory} DiagnosticCategory
 * @typedef {import('typescript').DiagnosticMessageChain} DiagnosticMessageChain
 * @typedef {import('typescript').JSDocTagInfo} JSDocTagInfo
 * @typedef {import('typescript').ScriptElementKind} ScriptElementKind
 * @typedef {import('typescript').SymbolDisplayPart} SymbolDisplayPart
 * @typedef {import('typescript').TextSpan} TextSpan
 */

/**
 * @param {Monaco} monaco
 * @param {ScriptElementKind} kind
 * @returns {CompletionItemKind} The matching Monaco completion item kind.
 */
export function convertScriptElementKind(monaco, kind) {
  switch (kind) {
    case 'primitive type':
    case 'keyword': {
      return monaco.languages.CompletionItemKind.Keyword
    }

    case 'var':
    case 'local var': {
      return monaco.languages.CompletionItemKind.Variable
    }

    case 'property':
    case 'getter':
    case 'setter': {
      return monaco.languages.CompletionItemKind.Field
    }

    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index': {
      return monaco.languages.CompletionItemKind.Function
    }

    case 'enum': {
      return monaco.languages.CompletionItemKind.Enum
    }

    case 'module': {
      return monaco.languages.CompletionItemKind.Module
    }

    case 'class': {
      return monaco.languages.CompletionItemKind.Class
    }

    case 'interface': {
      return monaco.languages.CompletionItemKind.Interface
    }

    case 'warning': {
      return monaco.languages.CompletionItemKind.File
    }

    default: {
      return monaco.languages.CompletionItemKind.Property
    }
  }
}

/**
 * @param {SymbolDisplayPart[] | undefined} displayParts
 * @returns {string} XXX
 */
export function displayPartsToString(displayParts) {
  if (displayParts) {
    return displayParts.map((displayPart) => displayPart.text).join('')
  }

  return ''
}

/**
 * @param {CompletionEntryDetails} details
 * @returns {string} XXX
 */
export function createDocumentationString(details) {
  let documentationString = displayPartsToString(details.documentation)
  if (details.tags) {
    for (const tag of details.tags) {
      documentationString += `\n\n${tagToString(tag)}`
    }
  }

  return documentationString
}

/**
 * @param {JSDocTagInfo} tag
 * @returns {string} XXX
 */
export function tagToString(tag) {
  let tagLabel = `*@${tag.name}*`
  if (tag.name === 'param' && tag.text) {
    const [parameterName, ...rest] = tag.text
    tagLabel += `\`${parameterName.text}\``
    if (rest.length > 0) tagLabel += ` — ${rest.map((r) => r.text).join(' ')}`
  } else if (Array.isArray(tag.text)) {
    tagLabel += ` — ${tag.text.map((r) => r.text).join(' ')}`
  } else if (tag.text) {
    tagLabel += ` — ${tag.text}`
  }

  return tagLabel
}

/**
 * @param {ITextModel} model
 * @param {TextSpan} span
 * @returns {IRange} XXX
 */
export function textSpanToRange(model, span) {
  const p1 = model.getPositionAt(span.start)
  const p2 = model.getPositionAt(span.start + span.length)
  const {lineNumber: startLineNumber, column: startColumn} = p1
  const {lineNumber: endLineNumber, column: endColumn} = p2
  return {startLineNumber, startColumn, endLineNumber, endColumn}
}

/**
 * @param {string | DiagnosticMessageChain | undefined} diag
 * @param {string} newLine
 * @param {number} [indent]
 * @returns {string} A flattened diagnostic text.
 */
function flattenDiagnosticMessageText(diag, newLine, indent = 0) {
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

    if (!relatedResource) {
      continue
    }

    const infoStart = info.start || 0
    // eslint-disable-next-line unicorn/explicit-length-check
    const infoLength = info.length || 1
    const {lineNumber: startLineNumber, column: startColumn} =
      relatedResource.getPositionAt(infoStart)
    const {lineNumber: endLineNumber, column: endColumn} =
      relatedResource.getPositionAt(infoStart + infoLength)

    result.push({
      resource: relatedResource.uri,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: flattenDiagnosticMessageText(info.messageText, '\n')
    })
  }

  return result
}

/**
 * @param {Monaco} monaco
 * @param {DiagnosticCategory} category
 * @returns {MarkerSeverity} TypeScript diagnostic severity as Monaco marker severity.
 */
function tsDiagnosticCategoryToMarkerSeverity(monaco, category) {
  switch (category) {
    case 0: {
      return monaco.MarkerSeverity.Warning
    }

    case 1: {
      return monaco.MarkerSeverity.Error
    }

    case 2: {
      return monaco.MarkerSeverity.Hint
    }

    default: {
      return monaco.MarkerSeverity.Info
    }
  }
}

/**
 * @param {Monaco} monaco
 * @param {ITextModel} model
 * @param {Diagnostic} diag
 * @returns {IMarkerData} The TypeScript diagnostic converted to Monaco marker data.
 */
export function convertDiagnostics(monaco, model, diag) {
  const diagStart = diag.start || 0
  // eslint-disable-next-line unicorn/explicit-length-check
  const diagLength = diag.length || 1
  const {lineNumber: startLineNumber, column: startColumn} =
    model.getPositionAt(diagStart)
  const {lineNumber: endLineNumber, column: endColumn} = model.getPositionAt(
    diagStart + diagLength
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
      diag.relatedInformation
    )
  }
}
