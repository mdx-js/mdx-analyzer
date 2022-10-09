import { createMDXLanguageService } from '@mdx-js/language-service'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import ts from 'typescript'
import { unified } from 'unified'
import {
  createConnection,
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
let languageService

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
  languageService = createMDXLanguageService(
    ts,
    {
      readFile(filename) {
        return ts.sys.readFile(filename)
      },
      writeFile: ts.sys.writeFile,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      readDirectory: ts.sys.readDirectory,
      realpath: ts.sys.realpath,
      fileExists(filename) {
        return ts.sys.fileExists(filename)
      },
      getCompilationSettings() {
        return {
          allowJs: true,
          jsx: ts.JsxEmit.Preserve,
          allowNonTsExtensions: true,
        }
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
    return []
  }

  return languageService.doLocationLinks(doc, params.position)
})

connection.onHover(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const info = languageService.getQuickInfoAtPosition(
    doc.uri,
    doc.offsetAt(params.position),
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
    range: textSpanToRange(doc, info.textSpan),
    contents: [
      {
        value: '```typescript\n' + contents + '\n```\n',
      },
      {
        value: documentation + (tags ? '\n\n' + tags : ''),
      },
    ],
  }
})

connection.listen()
documents.listen(connection)
