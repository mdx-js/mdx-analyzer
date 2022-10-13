/**
 * @typedef {import('typescript').CompletionEntryDetails} CompletionEntryDetails
 * @typedef {import('typescript').JSDocTagInfo} JSDocTagInfo
 * @typedef {import('typescript').SymbolDisplayPart} SymbolDisplayPart
 * @typedef {import('typescript').ScriptElementKind} ScriptElementKind
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import { CompletionItemKind, Range } from 'vscode-languageserver'

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
 * @param {SymbolDisplayPart[] | undefined} displayParts
 * @returns {string} XXX
 */
export function displayPartsToString(displayParts) {
  if (displayParts) {
    return displayParts.map(displayPart => displayPart.text).join('')
  }
  return ''
}

/**
 * @param {JSDocTagInfo} tag
 * @returns {string} XXX
 */
export function tagToString(tag) {
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
  const p2 = doc.positionAt(span.start + span.length)
  return Range.create(p1, p2)
}
