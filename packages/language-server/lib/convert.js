/**
 * @typedef {import('typescript')} ts
 * @typedef {import('typescript').CompletionEntryDetails} CompletionEntryDetails
 * @typedef {import('typescript').DefinitionInfo} DefinitionInfo
 * @typedef {import('typescript').Diagnostic} Diagnostic
 * @typedef {import('typescript').DiagnosticCategory} DiagnosticCategory
 * @typedef {import('typescript').DiagnosticMessageChain} DiagnosticMessageChain
 * @typedef {import('typescript').DiagnosticRelatedInformation} DiagnosticRelatedInformation
 * @typedef {import('typescript').JSDocTagInfo} JSDocTagInfo
 * @typedef {import('typescript').NavigationBarItem} NavigationBarItem
 * @typedef {import('typescript').OutliningSpanKind} OutliningSpanKind
 * @typedef {import('typescript').QuickInfo} QuickInfo
 * @typedef {import('typescript').SymbolDisplayPart} SymbolDisplayPart
 * @typedef {import('typescript').ScriptElementKind} ScriptElementKind
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('vscode-languageserver').Diagnostic} LspDiagnostic
 * @typedef {import('vscode-languageserver').DiagnosticRelatedInformation} LspDiagnosticRelatedInformation
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import {
  CompletionItemKind,
  DiagnosticSeverity,
  DiagnosticTag,
  DocumentSymbol,
  FoldingRangeKind,
  LocationLink,
  Range,
  SymbolKind
} from 'vscode-languageserver'
import {getOrReadDocByFileName} from './documents.js'

/**
 * Convert a TypeScript script element kind to a Monaco completion kind.
 *
 * @param {ScriptElementKind} kind
 *   The TypeScript script element kind to convert
 * @returns {CompletionItemKind}
 *   The matching Monaco completion item kind.
 */
export function convertScriptElementKind(kind) {
  switch (kind) {
    case 'primitive type':
    case 'keyword': {
      return CompletionItemKind.Keyword
    }

    case 'var':
    case 'local var': {
      return CompletionItemKind.Variable
    }

    case 'property':
    case 'getter':
    case 'setter': {
      return CompletionItemKind.Field
    }

    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index': {
      return CompletionItemKind.Function
    }

    case 'enum': {
      return CompletionItemKind.Enum
    }

    case 'module': {
      return CompletionItemKind.Module
    }

    case 'class': {
      return CompletionItemKind.Class
    }

    case 'interface': {
      return CompletionItemKind.Interface
    }

    case 'warning': {
      return CompletionItemKind.File
    }

    default: {
      return CompletionItemKind.Property
    }
  }
}

/**
 * Convert a TypeScript script element kind to a Monaco symbol.
 *
 * @param {ScriptElementKind} kind
 *   The TypeScript script element kind to convert
 * @returns {SymbolKind}
 *   The matching Monaco symbol kind.
 */
export function convertScriptElementKindToSymbolKind(kind) {
  switch (kind) {
    case 'property':
    case 'getter':
    case 'setter': {
      return SymbolKind.Property
    }

    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index': {
      return SymbolKind.Function
    }

    case 'enum': {
      return SymbolKind.Enum
    }

    case 'module': {
      return SymbolKind.Module
    }

    case 'class': {
      return SymbolKind.Class
    }

    case 'interface': {
      return SymbolKind.Interface
    }

    default: {
      return SymbolKind.Variable
    }
  }
}

/**
 * Create a markdown documentation string from TypeScript details.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {CompletionEntryDetails | QuickInfo} details
 *   The details to represent.
 * @returns {string}
 *   The details represented as a markdown string.
 */
export function createDocumentationString(ts, details) {
  let documentationString = ts.displayPartsToString(details.documentation)
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
function tagToString(tag) {
  let tagLabel = `*@${tag.name}*`
  if (tag.name === 'param' && tag.text) {
    const [parameterName, ...rest] = tag.text
    tagLabel += `\`${parameterName.text}\``
    if (rest.length > 0) {
      tagLabel += ` — ${rest.map((r) => r.text).join(' ')}`
    }
  } else if (Array.isArray(tag.text)) {
    tagLabel += ` — ${tag.text.map((r) => r.text).join(' ')}`
  } else if (tag.text) {
    tagLabel += ` — ${tag.text}`
  }

  return tagLabel
}

/**
 * Convert a text span to a LSP range that matches the given document.
 *
 * @param {TextDocument} doc
 *   The document to which the text span applies.
 * @param {TextSpan} span
 *   The TypeScript text span to convert.
 * @returns {Range}
 *   The text span as an LSP range.
 */
export function textSpanToRange(doc, span) {
  const p1 = doc.positionAt(span.start)
  const p2 = doc.positionAt(span.start + span.length || 1)
  return Range.create(p1, p2)
}

/**
 * Convert a TypeScript diagnostic category to an LSP severity.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {DiagnosticCategory} category
 *   The TypeScript diagnostic category to convert.
 * @returns {DiagnosticSeverity}
 *   THe TypeScript diagnostic severity as LSP diagnostic severity.
 */
function tsDiagnosticCategoryToMarkerSeverity(ts, category) {
  switch (category) {
    case ts.DiagnosticCategory.Warning: {
      return DiagnosticSeverity.Warning
    }

    case ts.DiagnosticCategory.Error: {
      return DiagnosticSeverity.Error
    }

    case ts.DiagnosticCategory.Suggestion: {
      return DiagnosticSeverity.Hint
    }

    default: {
      return DiagnosticSeverity.Information
    }
  }
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
 * Convert TypeScript diagnostic related information to LSP related information.
 *
 * @param {DiagnosticRelatedInformation[]} [relatedInformation]
 *   The TypeScript related information to convert.
 * @returns {LspDiagnosticRelatedInformation[]}
 *   TypeScript diagnostic related information as Monaco related information.
 */
function convertRelatedInformation(relatedInformation) {
  if (!relatedInformation) {
    return []
  }

  /** @type {LspDiagnosticRelatedInformation[]} */
  const result = []
  for (const info of relatedInformation) {
    if (!info.file?.fileName) {
      continue
    }

    const related = getOrReadDocByFileName(info.file.fileName)

    if (!related) {
      continue
    }

    const infoStart = info.start || 0
    const infoLength = info.length || 1
    const range = Range.create(
      related.positionAt(infoStart),
      related.positionAt(infoStart + infoLength)
    )

    result.push({
      location: {
        range,
        uri: related.uri
      },
      message: flattenDiagnosticMessageText(info.messageText)
    })
  }

  return result
}

/**
 * Convert a TypeScript dignostic to a LSP diagnostic.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {TextDocument} doc
 *   The text document to which the diagnostic applies.
 * @param {Diagnostic} diag
 *   The TypeScript diagnostic to convert.
 * @returns {LspDiagnostic}
 *   The TypeScript diagnostic converted to an LSP diagnostic.
 */
export function convertDiagnostics(ts, doc, diag) {
  const diagStart = diag.start || 0
  const diagLength = diag.length || 1
  const range = Range.create(
    doc.positionAt(diagStart),
    doc.positionAt(diagStart + diagLength)
  )

  /** @type {DiagnosticTag[]} */
  const tags = []
  if (diag.reportsUnnecessary) {
    tags.push(DiagnosticTag.Unnecessary)
  }

  if (diag.reportsDeprecated) {
    tags.push(DiagnosticTag.Deprecated)
  }

  return {
    code: `ts${diag.code}`,
    message: flattenDiagnosticMessageText(diag.messageText),
    range,
    relatedInformation: convertRelatedInformation(diag.relatedInformation),
    severity: tsDiagnosticCategoryToMarkerSeverity(ts, diag.category),
    tags
  }
}

/**
 * Convert TypeScript definition info to location links.
 *
 * @param {readonly DefinitionInfo[] | undefined} info
 *   The TypeScript definition info to convert.
 * @returns {LocationLink[] | undefined}
 *   The definition info represented as LSP location links.
 */
export function definitionInfoToLocationLinks(info) {
  if (!info) {
    return
  }

  /** @type {LocationLink[]} */
  const locationLinks = []
  for (const entry of info) {
    const entryDoc = getOrReadDocByFileName(entry.fileName)
    if (entryDoc) {
      locationLinks.push(
        LocationLink.create(
          entryDoc.uri,
          textSpanToRange(entryDoc, entry.textSpan),
          textSpanToRange(entryDoc, entry.textSpan)
        )
      )
    }
  }

  return locationLinks
}

/**
 * Convert TypeScript navigation bar items to location links.
 *
 * @param {TextDocument} doc
 *   The text document to which the navigation bar items apply.
 * @param {NavigationBarItem[]} items
 *   The navigation bar items to convert.
 * @returns {DocumentSymbol[]}
 *   The navigation bar items as document symvols
 */
export function convertNavigationBarItems(doc, items) {
  return items
    .filter((item) => item.kind !== 'module')
    .map((item) => {
      return DocumentSymbol.create(
        item.text,
        undefined,
        convertScriptElementKindToSymbolKind(item.kind),
        textSpanToRange(doc, item.spans[0]),
        textSpanToRange(doc, item.spans[0]),
        convertNavigationBarItems(doc, item.childItems)
      )
    })
}

/**
 * Convert a TypeScript outlining span kind to a LSP folding range kind.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {OutliningSpanKind} kind
 *   The TypeScript outlining span kind to convert.
 * @returns {FoldingRangeKind}
 *   The kind as an LSP folding range kind.
 */
export function convertOutliningSpanKind(ts, kind) {
  if (kind === ts.OutliningSpanKind.Comment) {
    return FoldingRangeKind.Comment
  }

  if (kind === ts.OutliningSpanKind.Imports) {
    return FoldingRangeKind.Imports
  }

  return FoldingRangeKind.Region
}
