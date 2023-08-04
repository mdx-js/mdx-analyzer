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
 * Convert a TypeScript script element kind to a Monaco completion item kind.
 *
 * @param {Monaco} monaco
 *   The Monaco editor module to use.
 * @param {ScriptElementKind} kind
 *   The TypeScript script element kind tp convert.
 * @returns {CompletionItemKind}
 *   The matching Monaco completion item kind.
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
 * Convert TypeScript symbol display parts to a string.
 *
 * @param {SymbolDisplayPart[] | undefined} displayParts
 *   The display parts to convert.
 * @returns {string}
 *   A string representation of the symbol display parts.
 */
export function displayPartsToString(displayParts) {
  if (displayParts) {
    return displayParts.map((displayPart) => displayPart.text).join('')
  }

  return ''
}

/**
 * Create a markdown documentation string
 *
 * @param {CompletionEntryDetails} details
 *   The details to represent.
 * @returns {string}
 *   The details represented as a markdown string.
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
 * Represent a TypeScript JSDoc tag as a string.
 *
 * @param {JSDocTagInfo} tag
 *   The JSDoc tag to represent.
 * @returns {string}
 *   A representation of the JSDoc tag.
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
 * Convert a text span to a Monaco range that matches the given model.
 *
 * @param {ITextModel} model
 *   The Monaco model to which the text span applies.
 * @param {TextSpan} span
 *   The TypeScript text span to convert.
 * @returns {IRange}
 *   The text span as a Monaco range.
 */
export function textSpanToRange(model, span) {
  const p1 = model.getPositionAt(span.start)
  const p2 = model.getPositionAt(span.start + span.length)
  const {lineNumber: startLineNumber, column: startColumn} = p1
  const {lineNumber: endLineNumber, column: endColumn} = p2
  return {startLineNumber, startColumn, endLineNumber, endColumn}
}

/**
 * Flatten a TypeScript diagnostic message chain into a string representation.
 * @param {string | DiagnosticMessageChain | undefined} diag
 *   The diagnostic to represent.
 * @param {number} [indent]
 *   The indentation to use.
 * @returns {string}
 *   A flattened diagnostic text.
 */
function flattenDiagnosticMessageText(diag, indent = 0) {
  if (typeof diag === 'string') {
    return diag
  }

  if (diag === undefined) {
    return ''
  }

  let result = ''
  if (indent) {
    result += `\n${'  '.repeat(indent)}`
  }

  result += diag.messageText
  indent++
  if (diag.next) {
    for (const kid of diag.next) {
      result += flattenDiagnosticMessageText(kid, indent)
    }
  }

  return result
}

/**
 * Convert TypeScript diagnostic related information to Monaco related
 * information.
 *
 * @param {ITextModel} model
 *   The Monaco model the information is related to.
 * @param {DiagnosticRelatedInformation[]} [relatedInformation]
 *   The TypeScript related information to convert.
 * @returns {IRelatedInformation[]}
 *   TypeScript diagnostic related information as Monaco related information.
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
      message: flattenDiagnosticMessageText(info.messageText)
    })
  }

  return result
}

/**
 * Convert a TypeScript diagnostic category to a Monaco diagnostic severity.
 *
 * @param {Monaco} monaco
 *   The Monaco editor module.
 * @param {DiagnosticCategory} category
 *   The TypeScript diagnostic category to convert.
 * @returns {MarkerSeverity}
 *   TypeScript diagnostic severity as Monaco marker severity.
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
 * Convert a TypeScript dignostic to a Monaco editor diagnostic.
 *
 * @param {Monaco} monaco
 *   The Monaco editor module to use.
 * @param {ITextModel} model
 *   The Monaco editor model to which the diagnostic applies.
 * @param {Diagnostic} diag
 *   The TypeScript diagnostic to convert.
 * @returns {IMarkerData}
 *   The TypeScript diagnostic converted to Monaco marker data.
 */
export function convertDiagnostics(monaco, model, diag) {
  const diagStart = diag.start || 0
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
    message: flattenDiagnosticMessageText(diag.messageText),
    code: diag.code.toString(),
    tags,
    relatedInformation: convertRelatedInformation(
      model,
      diag.relatedInformation
    )
  }
}
