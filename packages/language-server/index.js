import { createMDXLanguageService } from '@mdx-js/language-service'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import ts from 'typescript'
import { unified } from 'unified'
import {
  createConnection,
  LocationLink,
  MarkupKind,
  ProposedFeatures,
  Range,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js'
import { TextDocument } from 'vscode-languageserver-textdocument'

const processor = unified().use(remarkParse).use(remarkMdx)
const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
/** @type {ts.LanguageService} */
let ls

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
 * @param {TextDocument} doc
 * @param {ts.TextSpan} span
 * @returns {Range} XXX
 */
function textSpanToRange(doc, span) {
  const p1 = doc.positionAt(span.start)
  const p2 = doc.positionAt(span.start + span.length)
  return Range.create(p1, p2)
}

connection.onInitialize(() => {
  ls = createMDXLanguageService(
    ts,
    {
      readFile: ts.sys.readFile,
      writeFile: ts.sys.writeFile,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      readDirectory: ts.sys.readDirectory,
      realpath: ts.sys.realpath,
      fileExists: ts.sys.fileExists,
      getCompilationSettings() {
        return {}
      },
      getCurrentDirectory() {
        return process.cwd()
      },
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      getScriptFileNames: () => documents.keys(),
      getScriptSnapshot(fileName) {
        const doc = documents.get(fileName)

        if (!doc) {
          return
        }

        return ts.ScriptSnapshot.fromString(doc.getText())
      },
      getScriptVersion(filename) {
        const doc = documents.get(filename)

        return String(doc?.version)
      },
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    },
    processor,
  )

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      definitionProvider: true,
      hoverProvider: true,
    },
  }
})

connection.onDefinition(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const entries = ls.getDefinitionAtPosition(
    doc.uri,
    doc.offsetAt(params.position),
  )

  if (!entries) {
    return
  }

  /** @type {LocationLink[]} */
  const result = []
  for (const entry of entries) {
    if (entry.fileName === doc.uri) {
      result.push(
        LocationLink.create(
          entry.fileName,
          textSpanToRange(doc, entry.textSpan),
          textSpanToRange(doc, entry.textSpan),
        ),
      )
    }
  }
  return result
})

connection.onHover(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const info = ls.getQuickInfoAtPosition(doc.uri, doc.offsetAt(params.position))

  if (!info) {
    return
  }

  const documentation = displayPartsToString(info.documentation)
  const tags = info.tags
    ? info.tags.map(tag => tagToString(tag)).join('  \n\n')
    : ''
  const contents = displayPartsToString(info.displayParts)

  return {
    range: textSpanToRange(doc, info.textSpan),
    contents: {
      kind: MarkupKind.Markdown,
      value:
        '```typescript\n' +
        contents +
        '\n```\n' +
        documentation +
        (tags ? '\n\n' + tags : ''),
    },
  }
})

connection.listen()
documents.listen(connection)
