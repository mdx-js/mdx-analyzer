/**
 * @typedef {import('typescript')} ts
 * @typedef {import('typescript').CompletionEntryDetails} CompletionEntryDetails
 * @typedef {import('typescript').DefinitionInfo} DefinitionInfo
 * @typedef {import('typescript').Diagnostic} Diagnostic
 * @typedef {import('typescript').DiagnosticCategory} DiagnosticCategory
 * @typedef {import('typescript').DiagnosticMessageChain} DiagnosticMessageChain
 * @typedef {import('typescript').DiagnosticRelatedInformation} DiagnosticRelatedInformation
 * @typedef {import('typescript').JSDocTagInfo} JSDocTagInfo
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
  LocationLink,
  Range,
} from 'vscode-languageserver'

import { documents } from './documents.js'

/**
 * @param {ScriptElementKind} kind
 * @returns {CompletionItemKind} The matching Monaco completion item kind.
 */
export function convertScriptElementKind(kind) {
  switch (kind) {
    case 'primitive type':
    case 'keyword':
      return CompletionItemKind.Keyword
    case 'var':
    case 'local var':
      return CompletionItemKind.Variable
    case 'property':
    case 'getter':
    case 'setter':
      return CompletionItemKind.Field
    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index':
      return CompletionItemKind.Function
    case 'enum':
      return CompletionItemKind.Enum
    case 'module':
      return CompletionItemKind.Module
    case 'class':
      return CompletionItemKind.Class
    case 'interface':
      return CompletionItemKind.Interface
    case 'warning':
      return CompletionItemKind.File
  }
  return CompletionItemKind.Property
}

/**
 * @param {ts} ts
 * @param {CompletionEntryDetails | QuickInfo} details
 * @returns {string} XXX
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
 * @param {JSDocTagInfo} tag
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
 * @param {TextDocument} doc
 * @param {TextSpan} span
 * @returns {Range} XXX
 */
export function textSpanToRange(doc, span) {
  const p1 = doc.positionAt(span.start)
  const p2 = doc.positionAt(span.start + span.length || 1)
  return Range.create(p1, p2)
}

/**
 * @param {ts} ts
 * @param {DiagnosticCategory} category
 * @returns {DiagnosticSeverity} TypeScript diagnostic severity as Monaco marker severity.
 */
function tsDiagnosticCategoryToMarkerSeverity(ts, category) {
  switch (category) {
    case ts.DiagnosticCategory.Warning:
      return DiagnosticSeverity.Warning
    case ts.DiagnosticCategory.Error:
      return DiagnosticSeverity.Error
    case ts.DiagnosticCategory.Suggestion:
      return DiagnosticSeverity.Hint
  }
  return DiagnosticSeverity.Information
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
 * @param {DiagnosticRelatedInformation[]} [relatedInformation]
 * @returns {LspDiagnosticRelatedInformation[]} TypeScript diagnostic related information as Monaco related information.
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

    const related = documents.get(info.file.fileName)

    if (!related) {
      continue
    }

    const infoStart = info.start || 0
    // eslint-disable-next-line unicorn/explicit-length-check
    const infoLength = info.length || 1
    const range = Range.create(
      related.positionAt(infoStart),
      related.positionAt(infoStart + infoLength),
    )

    result.push({
      location: {
        range,
        uri: related.uri,
      },
      message: flattenDiagnosticMessageText(info.messageText, '\n'),
    })
  }
  return result
}

/**
 * @param {ts} ts
 * @param {TextDocument} doc
 * @param {Diagnostic} diag
 * @returns {LspDiagnostic} The TypeScript diagnostic converted to Monaco marker data.
 */
export function convertDiagnostics(ts, doc, diag) {
  const diagStart = diag.start || 0
  // eslint-disable-next-line unicorn/explicit-length-check
  const diagLength = diag.length || 1
  const range = Range.create(
    doc.positionAt(diagStart),
    doc.positionAt(diagStart + diagLength),
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
    message: flattenDiagnosticMessageText(diag.messageText, '\n'),
    range,
    relatedInformation: convertRelatedInformation(diag.relatedInformation),
    severity: tsDiagnosticCategoryToMarkerSeverity(ts, diag.category),
    tags,
  }
}

/**
 * Convert TypeScript definition info to location links.
 *
 * @param {TextDocument} doc
 * @param {readonly DefinitionInfo[] | undefined} info
 * @returns {LocationLink[] | undefined} The location links
 */
export function definitionInfoToLocationLinks(doc, info) {
  if (!info) {
    return
  }

  return info.map(entry =>
    LocationLink.create(
      entry.fileName,
      textSpanToRange(doc, entry.textSpan),
      textSpanToRange(doc, entry.textSpan),
    ),
  )
}
