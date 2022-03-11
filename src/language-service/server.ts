import * as path from 'path'

import {
  Range,
  Diagnostic,
  Location,
  createConnection,
  InitializeResult,
  IPCMessageReader,
  IPCMessageWriter,
  InitializeParams,
  Connection,
  Position,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type * as ts from 'typescript/lib/tsserverlibrary'
import { URI } from 'vscode-uri'
import { SourceMapConsumer } from 'source-map'
import { CompletionContext } from 'vscode'

import {
  normalizePath,
  assertDef,
  createLanguageServiceHost,
  createParseConfigHost,
  createParsedCommandLineFromConfig,
  createPatchedCompilerOptions,
  ExtensionOptions,
  first,
  ProxyFileOptions,
  readTsConfig,
  SnapshotManager,
  uriIsFile,
  uriToFsPath,
  normalizeFileName,
  fsPathToUri,
  tsTextSpanToVSCodeRange,
  isDef,
  DocumentsManager,
} from '../common'

interface Options {
  extensionOptionsFactory: (typescript: typeof ts) => ExtensionOptions
  convertion: (
    fileName: string,
    text: string,
  ) => { code: string; map: Promise<SourceMapConsumer> }
}

export function startServer(options: Options) {
  const { extensionOptionsFactory, convertion } = options

  const connection = createConnection(
    new IPCMessageReader(process),
    new IPCMessageWriter(process),
  )

  connection.onInitialize(onInitialize)
  connection.listen()

  function getTsInstance(tsServerPath: string): typeof ts {
    return require(path.resolve(tsServerPath))
  }

  function onInitialize(param: InitializeParams) {
    const rootPath = getRootPath(param)
    assertDef(rootPath)

    const tsServerPath = param.initializationOptions.serverPath
    const ts = getTsInstance(tsServerPath)

    const extensionOptions = extensionOptionsFactory(ts)

    const documentsManager = new DocumentsManager({
      getGeneratedDocumentArgsFromDoc(fileName, doc) {
        return convertion(fileName, doc.getText())
      },
      onDidChangeGeneratedCode(fileName: string, code: string) {
        snapshotManager.update(fileName, () =>
          ts.ScriptSnapshot.fromString(code),
        )
        sendDiagnostic(fileName)
      },
    })

    documentsManager.listen(connection)

    const snapshotManager = new SnapshotManager({
      ts,
      createSnapshot,
      readFile: ts.sys.readFile,
    })
    function createSnapshot(
      fileName: string,
      text: string,
    ): ts.IScriptSnapshot {
      if (!fileName.endsWith(extensionOptions.fromExtension)) {
        return ts.ScriptSnapshot.fromString(text)
      }

      const result = convertion(fileName, text)
      const getArgs = () => result
      documentsManager.addOrUpdateGeneratedDocumentAndSourceMap(
        fileName,
        getArgs,
        1,
      )

      return ts.ScriptSnapshot.fromString(result.code)
    }

    const tsConfigFilePath = path.join(rootPath, 'tsconfig.json')
    const { config, realTsConfigPath } = readTsConfig({ ts, tsConfigFilePath })
    const parseConfigHost = createParseConfigHost({ ts, ...extensionOptions })
    const parsedCommandLine = createParsedCommandLineFromConfig({
      ts,
      config,
      host: parseConfigHost,
      realTsConfigPath,
    })
    const compilerOptions = createPatchedCompilerOptions({
      ts,
      ...extensionOptions,
      options: parsedCommandLine.options,
    })

    const proxyFileOptions: ProxyFileOptions = {
      getScriptFileNames: function (): string[] {
        return [
          ...new Set([
            ...parsedCommandLine.fileNames,
            ...snapshotManager.keys(),
            ts.getDefaultLibFilePath(compilerOptions),
          ]),
        ]
      },
      getScriptSnapshot: function (
        fileName: string,
      ): ts.IScriptSnapshot | undefined {
        return snapshotManager.createOrGet(fileName)
      },
      getScriptVersion: function (fileName: string): string {
        const version = snapshotManager.getVersion(fileName) ?? 0
        return version.toString()
      },
    }

    const languageServiceHost = createLanguageServiceHost({
      ...extensionOptions,
      ts,
      rootPath,
      getOptions: () => compilerOptions,
      getProxyFileOptions: () => proxyFileOptions,
    })

    const ls = ts.createLanguageService(languageServiceHost)
    resigterLanguageFeatures(connection)

    const result: InitializeResult = {
      capabilities: {
        hoverProvider: true,
        definitionProvider: true,
        completionProvider: {
          triggerCharacters: [
            '.',
            '"',
            "'",
            '`',
            '/',
            '@',
            '<',
            '#',
            ' ',
          ] as ts.CompletionsTriggerCharacter[],
        },
      },
    }
    return result

    function resigterLanguageFeatures(connection: Connection) {
      connection.onHover(async event => {
        const { position, textDocument } = event
        const doc = documentsManager.getOrLoadOriginalDocument(textDocument.uri)
        if (!doc) {
          return
        }

        const fileName = normalizePath(textDocument.uri)
        const info = await getQuickInfoAtPosition(fileName, position, doc)
        if (!info?.displayParts) {
          return
        }

        return {
          contents: ts.displayPartsToString(info.displayParts),
        }
      })

      connection.onDefinition(async event => {
        const { position, textDocument } = event
        const doc = documentsManager.getOrLoadOriginalDocument(textDocument.uri)
        if (!doc) {
          return []
        }

        const fileName = normalizePath(textDocument.uri)
        return await getDefinitionAndBoundSpan(fileName, position, doc)
      })

      connection.onCompletion(async event => {
        const { position, textDocument, context } = event
        const doc = documentsManager.getOrLoadOriginalDocument(textDocument.uri)
        if (!doc) {
          return []
        }

        const fileName = normalizePath(textDocument.uri)
        const info = await getCompletionsAtPosition(
          fileName,
          position,
          doc,
          context,
        )
        return info?.entries.map(x => ({
          label: x.name,
        }))
      })
    }

    async function sendDiagnostic(fileName: string) {
      const doc = documentsManager.getGeneratedDocument(fileName)
      if (!doc) {
        return
      }

      const syntacticDiags = ls.getSyntacticDiagnostics(fileName)
      const semanticDiags = ls.getSemanticDiagnostics(fileName)

      const diags = await Promise.all(
        [...syntacticDiags, ...semanticDiags].map(transformDiagnostic),
      )

      connection.sendDiagnostics({
        uri: fsPathToUri(fileName),
        version: doc.version,
        diagnostics: diags.filter(isDef),
      })

      async function transformDiagnostic(
        diag: ts.Diagnostic,
      ): Promise<Diagnostic | undefined> {
        if (!diag.start || diag.length === 0) {
          return undefined
        }

        const entry = documentsManager.getGeneratedDocumentEntry(fileName)
        if (!entry) {
          return
        }
        const sourceMapConsumer = await entry.map
        const generatedDocument = entry.doc

        const startPosition = generatedDocument.positionAt(diag.start)
        const endPosition = generatedDocument.positionAt(
          diag.start + diag.length,
        )

        const originalStartPosition = sourceMapConsumer.originalPositionFor({
          line: startPosition.line + 1,
          column: startPosition.character + 1,
        })
        const originalEndPosition = sourceMapConsumer.originalPositionFor({
          line: endPosition.line + 1,
          column: endPosition.character + 1,
        })
        if (
          !originalStartPosition.line ||
          !originalStartPosition.column ||
          !originalEndPosition.line ||
          !originalEndPosition.column
        ) {
          return undefined
        }

        return {
          range: Range.create(
            {
              line: originalStartPosition.line - 1,
              character: originalStartPosition.column - 1,
            },
            {
              line: originalEndPosition.line - 1,
              character: originalEndPosition.column - 1,
            },
          ),
          message:
            typeof diag.messageText === 'string'
              ? diag.messageText
              : diag.messageText.messageText,
        }
      }
    }

    async function getCompletionsAtPosition(
      fileName: string,
      position: Position,
      doc: TextDocument,
      context: CompletionContext | undefined,
    ) {
      if (!fileName.endsWith(extensionOptions.fromExtension)) {
        return ls.getCompletionsAtPosition(fileName, doc.offsetAt(position), {
          triggerCharacter: context?.triggerCharacter as any,
          triggerKind: context?.triggerKind as any,
          includeExternalModuleExports: true,
          includeCompletionsForModuleExports: true,
          includeCompletionsWithInsertText: true,
        })
      }

      const entry = documentsManager.getGeneratedDocumentEntry(fileName)
      if (!entry) {
        return
      }
      const sourceMapConsumer = await entry.map
      const generatedDocument = entry.doc

      const generatedPositionArgs = {
        source: fileName,
        line: position.line + 1,
        column: position.character + 1,
      }
      const generatedPosition = sourceMapConsumer.generatedPositionFor(
        generatedPositionArgs,
      )
      if (!generatedPosition.line || !generatedPosition.column) {
        return
      }
      const offset = generatedDocument.offsetAt({
        line: generatedPosition.line - 1,
        character: generatedPosition.column - 1,
      })
      return ls.getCompletionsAtPosition(fileName, offset, {
        triggerCharacter: context?.triggerCharacter as any,
        triggerKind: context?.triggerKind as any,
        includeExternalModuleExports: true,
        includeCompletionsForModuleExports: true,
        includeCompletionsWithInsertText: true,
      })
    }

    async function getDefinitionAndBoundSpan(
      fileName: string,
      position: Position,
      doc: TextDocument,
    ): Promise<Location[] | undefined> {
      if (!fileName.endsWith(extensionOptions.fromExtension)) {
        const result = ls.getDefinitionAndBoundSpan(
          fileName,
          doc.offsetAt(position),
        )
        if (!result?.definitions?.length) {
          return undefined
        }

        const locations = await Promise.all(
          result.definitions.map(d => doDefinitionTransform(d.fileName, d)),
        )
        return locations.filter(isDef)
      }

      const entry = documentsManager.getGeneratedDocumentEntry(fileName)
      if (!entry) {
        return
      }
      const sourceMapConsumer = await entry.map
      const generatedDocument = entry.doc

      const generatedPositionArgs = {
        source: fileName,
        line: position.line + 1,
        column: position.character + 1,
      }
      const generatedPosition = sourceMapConsumer.generatedPositionFor(
        generatedPositionArgs,
      )
      if (!generatedPosition.line || !generatedPosition.column) {
        return undefined
      }

      const offset = generatedDocument.offsetAt({
        line: generatedPosition.line - 1,
        character: generatedPosition.column - 1,
      })
      const result = ls.getDefinitionAndBoundSpan(fileName, offset)

      if (!result?.definitions?.length) {
        return undefined
      }

      const definitions = await Promise.all(
        result.definitions.map(async definition => {
          const definitionFileName = normalizeFileName(definition.fileName)
          return doDefinitionTransform(definitionFileName, definition)
        }),
      )
      return definitions.filter(isDef)

      async function doDefinitionTransform(
        fileName: string,
        definition: ts.DefinitionInfo,
      ): Promise<Location | undefined> {
        if (!fileName.endsWith(extensionOptions.fromExtension)) {
          const doc = documentsManager.getOrLoadOriginalDocument(fileName)
          if (!doc) {
            return undefined
          }

          return Location.create(
            fsPathToUri(fileName),
            tsTextSpanToVSCodeRange(definition.textSpan, offset =>
              doc.positionAt(offset),
            ),
          )
        }

        const entry = documentsManager.getGeneratedDocumentEntry(fileName)
        if (!entry) {
          return
        }
        const sourceDefinitionMapConsumer = await entry.map
        const generatedDefinitionDocument = entry.doc

        const definitionDocument =
          documentsManager.getOrLoadOriginalDocument(fileName)
        if (!definitionDocument) {
          return undefined
        }

        const start = definition.textSpan.start
        const end = start + definition.textSpan.length
        const startPosition = generatedDefinitionDocument.positionAt(start)
        const endPosition = generatedDefinitionDocument.positionAt(end)

        const originalStartPosition =
          sourceDefinitionMapConsumer.originalPositionFor({
            line: startPosition.line + 1,
            column: startPosition.character + 1,
          })
        const originalEndPosition =
          sourceDefinitionMapConsumer.originalPositionFor({
            line: endPosition.line + 1,
            column: endPosition.character + 1,
          })

        if (
          !originalStartPosition.line ||
          !originalStartPosition.column ||
          !originalEndPosition.line ||
          !originalEndPosition.column
        ) {
          return undefined
        }

        return Location.create(
          fsPathToUri(fileName),
          Range.create(
            {
              line: originalStartPosition.line,
              character: originalStartPosition.column,
            },
            {
              line: originalEndPosition.line,
              character: originalEndPosition.column,
            },
          ),
        )
      }
    }

    async function getQuickInfoAtPosition(
      fileName: string,
      position: Position,
      doc: TextDocument,
    ) {
      if (!fileName.endsWith(extensionOptions.fromExtension)) {
        return ls.getQuickInfoAtPosition(fileName, doc.offsetAt(position))
      }

      const entry = documentsManager.getGeneratedDocumentEntry(fileName)
      if (!entry) {
        return
      }
      const sourceMapConsumer = await entry.map
      const generatedDocument = entry.doc

      const generatedPositionArgs = {
        source: fileName,
        line: position.line + 1,
        column: position.character + 1,
      }
      const generatedPosition = sourceMapConsumer.generatedPositionFor(
        generatedPositionArgs,
      )
      if (!generatedPosition.line || !generatedPosition.column) {
        return
      }

      const offset = generatedDocument.offsetAt({
        line: generatedPosition.line - 1,
        character: generatedPosition.column - 1,
      })
      return ls.getQuickInfoAtPosition(fileName, offset)
    }
  }

  function getRootPath(param: InitializeParams) {
    if (
      param.capabilities.workspace?.workspaceFolders &&
      param.workspaceFolders?.length
    ) {
      return first(
        param.workspaceFolders
          .map(folder => URI.parse(folder.uri))
          .filter(uriIsFile)
          .map(x => x.fsPath),
      )
    }
    if (param.rootUri) {
      const rootUri = URI.parse(param.rootUri)
      if (uriIsFile(rootUri)) {
        return rootUri.fsPath
      }
    }
    return param.rootPath
  }
}
