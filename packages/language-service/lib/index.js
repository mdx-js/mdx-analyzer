/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').Diagnostic} Diagnostic
 * @typedef {import('typescript').DiagnosticWithLocation} DiagnosticWithLocation
 * @typedef {import('typescript').DocumentSpan} DocumentSpan
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('typescript').LanguageServiceHost} LanguageServiceHost
 * @typedef {import('typescript').SymbolDisplayPart} SymbolDisplayPart
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('unified').PluggableList} PluggableList
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { getMarkdownDefinitionAtPosition } from './markdown.js'
import {
  getJSXPosition,
  getOriginalPosition,
  mdxToJsx,
  unistPositionToTextSpan,
} from './utils.js'

/**
 * @param {string} fileName
 * @returns {fileName is `${string}.mdx`} Whether or not the filename contains MDX.
 */
function isMdx(fileName) {
  return fileName.endsWith('.mdx')
}

/**
 * @param {string} fileName
 * @param {IScriptSnapshot | undefined} snapshot
 * @param {TextSpan} textSpan
 */
function patchTextSpan(fileName, snapshot, textSpan) {
  if (snapshot && isMdx(fileName)) {
    textSpan.start = getOriginalPosition(snapshot, textSpan.start)
  }
}

/**
 * @param {import('typescript')} ts
 * @param {LanguageServiceHost} host
 * @param {PluggableList} [plugins]
 * @returns {LanguageService} XXX
 */
export function createMDXLanguageService(ts, host, plugins) {
  const processor = unified().use(remarkParse).use(remarkMdx)
  if (plugins) {
    processor.use(plugins)
  }

  /** @type {LanguageServiceHost} */
  const internalHost = {
    fileExists: host.fileExists.bind(host),
    getCurrentDirectory: host.getCurrentDirectory.bind(host),
    getDefaultLibFileName: host.getDefaultLibFileName.bind(host),
    getScriptFileNames: host.getScriptFileNames.bind(host),
    getScriptVersion: host.getScriptVersion.bind(host),
    readFile: host.readFile.bind(host),

    directoryExists: host.directoryExists?.bind(host),
    error: host.error?.bind(host),
    getCancellationToken: host.getCancellationToken?.bind(host),
    getCompilerHost: host.getCompilerHost?.bind(host),
    getCustomTransformers: host.getCustomTransformers?.bind(host),
    getDirectories: host.getDirectories?.bind(host),
    getLocalizedDiagnosticMessages:
      host.getLocalizedDiagnosticMessages?.bind(host),
    getNewLine: host.getNewLine?.bind(host),
    getParsedCommandLine: host.getParsedCommandLine?.bind(host),
    getProjectReferences: host.getProjectReferences?.bind(host),
    getProjectVersion: host.getProjectVersion?.bind(host),
    getResolvedModuleWithFailedLookupLocationsFromCache:
      host.getResolvedModuleWithFailedLookupLocationsFromCache?.bind(host),
    getTypeRootsVersion: host.getTypeRootsVersion?.bind(host),
    installPackage: host.installPackage?.bind(host),
    isKnownTypesPackageName: host.isKnownTypesPackageName?.bind(host),
    log: host.log?.bind(host),
    readDirectory: host.readDirectory?.bind(host),
    realpath: host.realpath?.bind(host),
    resolveModuleNames: host.resolveModuleNames?.bind(host),
    resolveTypeReferenceDirectives:
      host.resolveTypeReferenceDirectives?.bind(host),
    trace: host.trace?.bind(host),
    useCaseSensitiveFileNames: host.useCaseSensitiveFileNames?.bind(host),
    writeFile: host.writeFile?.bind(host),

    getCompilationSettings() {
      return {
        jsx: ts.JsxEmit.Preserve,
        ...host.getCompilationSettings(),
        allowJs: true,
        allowNonTsExtensions: true,
      }
    },

    getScriptKind(fileName) {
      if (isMdx(fileName)) {
        return ts.ScriptKind.JSX
      }
      return host.getScriptKind?.(fileName) ?? ts.ScriptKind.JS
    },

    getScriptSnapshot(fileName) {
      const snapshot = host.getScriptSnapshot(fileName)

      if (!snapshot || !isMdx(fileName)) {
        return snapshot
      }

      const length = snapshot.getLength()
      const mdx = snapshot.getText(0, length)
      const js = mdxToJsx(mdx, processor)

      return {
        getText: (start, end) => js.slice(start, end),
        getLength: () => js.length,
        // eslint-disable-next-line unicorn/no-useless-undefined
        getChangeRange: () => undefined,
        dispose() {
          snapshot.dispose?.()
        },
      }
    },
  }

  const ls = ts.createLanguageService(internalHost)

  /**
   * @param {readonly DocumentSpan[]} documentSpans
   */
  function patchDocumentSpans(documentSpans) {
    for (const documentSpan of documentSpans) {
      const snapshot = host.getScriptSnapshot(documentSpan.fileName)
      patchTextSpan(documentSpan.fileName, snapshot, documentSpan.textSpan)

      if (documentSpan.contextSpan) {
        patchTextSpan(documentSpan.fileName, snapshot, documentSpan.contextSpan)
      }

      if (documentSpan.originalFileName) {
        const originalSnapshot = host.getScriptSnapshot(
          documentSpan.originalFileName,
        )

        if (documentSpan.originalContextSpan) {
          patchTextSpan(
            documentSpan.originalFileName,
            originalSnapshot,
            documentSpan.originalContextSpan,
          )
        }

        if (documentSpan.originalTextSpan) {
          patchTextSpan(
            documentSpan.originalFileName,
            originalSnapshot,
            documentSpan.originalTextSpan,
          )
        }
      }
    }
  }

  /**
   * @param {Diagnostic} diagnostic
   */
  function patchDiagnostic(diagnostic) {
    const fileName = diagnostic.file?.fileName
    if (!fileName || !isMdx(fileName)) {
      return
    }

    const snapshot = host.getScriptSnapshot(fileName)

    if (!snapshot) {
      return
    }

    if (diagnostic.start != null) {
      diagnostic.start = getOriginalPosition(snapshot, diagnostic.start)
    }
  }

  /**
   * @param {DiagnosticWithLocation[]} diagnostics
   */
  function patchDiagnosticsWithLocation(diagnostics) {
    for (const diagnostic of diagnostics) {
      patchDiagnostic(diagnostic)
    }
  }

  return {
    applyCodeActionCommand(...args) {
      // @ts-expect-error XXX
      return ls.applyCodeActionCommand(...args)
    },

    cleanupSemanticCache() {
      ls.cleanupSemanticCache()
    },

    commentSelection(fileName, textRange) {
      if (isMdx(fileName)) {
        throw new Error('commentSelection isn’t supported for MDX files.')
      }
      return ls.commentSelection(fileName, textRange)
    },

    dispose() {
      ls.dispose()
    },

    findReferences(fileName, position) {
      const referenceSymbols = ls.findReferences(fileName, position)

      if (referenceSymbols) {
        for (const referenceSymbol of referenceSymbols) {
          patchDocumentSpans(referenceSymbol.references)
        }
      }

      return referenceSymbols
    },

    findRenameLocations(
      fileName,
      position,
      findInStrings,
      findInComments,
      providePrefixAndSuffixTextForRename,
    ) {
      if (!isMdx(fileName)) {
        return ls.findRenameLocations(
          fileName,
          position,
          findInStrings,
          findInComments,
          providePrefixAndSuffixTextForRename,
        )
      }

      // XXX
    },

    getApplicableRefactors(
      fileName,
      positionOrRange,
      preferences,
      triggerReason,
      kind,
    ) {
      if (!isMdx(fileName)) {
        return ls.getApplicableRefactors(
          fileName,
          positionOrRange,
          preferences,
          triggerReason,
          kind,
        )
      }

      // XXX
      return []
    },

    getBraceMatchingAtPosition(fileName, position) {
      const textSpans = ls.getBraceMatchingAtPosition(fileName, position)

      const snapshot = host.getScriptSnapshot(fileName)

      for (const textSpan of textSpans) {
        patchTextSpan(fileName, snapshot, textSpan)
      }

      return textSpans
    },

    getBreakpointStatementAtPosition(fileName, position) {
      const textSpan = ls.getBreakpointStatementAtPosition(fileName, position)

      if (!textSpan) {
        return
      }

      const snapshot = host.getScriptSnapshot(fileName)

      if (snapshot) {
        patchTextSpan(fileName, snapshot, textSpan)
      }

      return textSpan
    },

    getCodeFixesAtPosition(
      fileName,
      start,
      end,
      errorCodes,
      formatOptions,
      preferences,
    ) {
      if (!isMdx(fileName)) {
        return ls.getCodeFixesAtPosition(
          fileName,
          start,
          end,
          errorCodes,
          formatOptions,
          preferences,
        )
      }

      // XXX
      return []
    },

    getCombinedCodeFix(scope, fixId, formatOptions, preferences) {
      return ls.getCombinedCodeFix(scope, fixId, formatOptions, preferences)
    },

    getCompilerOptionsDiagnostics() {
      return ls.getCompilerOptionsDiagnostics()
    },

    getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data,
    ) {
      const details = ls.getCompletionEntryDetails(
        fileName,
        position,
        entryName,
        formatOptions,
        source,
        preferences,
        data,
      )

      if (details || !isMdx(fileName)) {
        return details
      }

      const snapshot = host.getScriptSnapshot(fileName)

      if (!snapshot) {
        return details
      }

      return ls.getCompletionEntryDetails(
        fileName,
        getJSXPosition(snapshot, position),
        entryName,
        formatOptions,
        source,
        preferences,
        data,
      )
    },

    getCompletionEntrySymbol(fileName, position, name, source) {
      if (!isMdx(fileName)) {
        return ls.getCompletionEntrySymbol(fileName, position, name, source)
      }

      // XXX
    },

    getCompletionsAtPosition(fileName, position, options, formattingSettings) {
      let completionInfo = ls.getCompletionsAtPosition(
        fileName,
        position,
        options,
        formattingSettings,
      )

      if (!isMdx(fileName)) {
        return completionInfo
      }

      const snapshot = host.getScriptSnapshot(fileName)

      if (!snapshot) {
        return completionInfo
      }

      if (!completionInfo) {
        completionInfo = ls.getCompletionsAtPosition(
          fileName,
          getJSXPosition(snapshot, position),
          options,
          formattingSettings,
        )
        if (completionInfo?.optionalReplacementSpan) {
          patchTextSpan(
            fileName,
            snapshot,
            completionInfo.optionalReplacementSpan,
          )
        }
        if (completionInfo?.entries) {
          for (const entry of completionInfo.entries) {
            if (entry.replacementSpan) {
              patchTextSpan(fileName, snapshot, entry.replacementSpan)
            }
          }
        }
      }

      return completionInfo
    },

    getDefinitionAndBoundSpan(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getDefinitionAndBoundSpan(fileName, position)
      }

      // XXX
    },

    getDefinitionAtPosition(fileName, position) {
      const snapshot = host.getScriptSnapshot(fileName)

      if (!snapshot) {
        return
      }

      let definition = ls.getDefinitionAtPosition(fileName, position)
      if (!definition?.length) {
        definition = ls.getDefinitionAtPosition(
          fileName,
          getJSXPosition(snapshot, position),
        )
      }

      if (definition) {
        patchDocumentSpans(definition)
      } else {
        definition = []
      }

      if (!isMdx(fileName)) {
        return definition
      }

      const node = getMarkdownDefinitionAtPosition(
        processor.parse(snapshot.getText(0, snapshot.getLength())),
        position,
      )

      if (!node?.position) {
        return definition
      }

      return [
        ...definition,
        {
          textSpan: unistPositionToTextSpan(node.position),
          fileName,
          kind: ts.ScriptElementKind.linkName,
          name: fileName,
          containerKind: ts.ScriptElementKind.linkName,
          containerName: fileName,
        },
      ]
    },

    getDocCommentTemplateAtPosition(fileName, position, options) {
      if (!isMdx(fileName)) {
        return ls.getDocCommentTemplateAtPosition(fileName, position, options)
      }

      // XXX
    },

    getDocumentHighlights(fileName, position, filesToSearch) {
      if (!isMdx(fileName)) {
        return ls.getDocumentHighlights(fileName, position, filesToSearch)
      }

      // XXX
    },

    getEditsForFileRename(
      oldFilePath,
      newFilePath,
      formatOptions,
      preferences,
    ) {
      if (!isMdx(newFilePath)) {
        return ls.getEditsForFileRename(
          oldFilePath,
          newFilePath,
          formatOptions,
          preferences,
        )
      }

      // XXX
      return []
    },

    getEditsForRefactor(
      fileName,
      formatOptions,
      positionOrRange,
      refactorName,
      actionName,
      preferences,
    ) {
      if (!isMdx(fileName)) {
        return ls.getEditsForRefactor(
          fileName,
          formatOptions,
          positionOrRange,
          refactorName,
          actionName,
          preferences,
        )
      }

      // XXX
    },

    getEmitOutput(fileName, emitOnlyDtsFiles, forceDtsEmit) {
      if (!isMdx(fileName)) {
        return ls.getEmitOutput(fileName, emitOnlyDtsFiles, forceDtsEmit)
      }

      throw new Error('getEmitOutput is not supported for MDX files')
    },

    getEncodedSemanticClassifications(fileName, span, format) {
      if (!isMdx(fileName)) {
        return ls.getEncodedSemanticClassifications(fileName, span, format)
      }

      throw new Error(
        'getEncodedSemanticClassifications is not supported for MDX files',
      )
    },

    getEncodedSyntacticClassifications(fileName, span) {
      if (!isMdx(fileName)) {
        return ls.getEncodedSyntacticClassifications(fileName, span)
      }

      throw new Error(
        'getEncodedSyntacticClassifications is not supported for MDX files',
      )
    },

    getFileReferences(fileName) {
      if (!isMdx(fileName)) {
        return ls.getFileReferences(fileName)
      }

      throw new Error('getFileReferences is not supported for MDX files')
    },

    getFormattingEditsAfterKeystroke(fileName, position, key, options) {
      if (!isMdx(fileName)) {
        return ls.getFormattingEditsAfterKeystroke(
          fileName,
          position,
          key,
          options,
        )
      }

      throw new Error(
        'getFormattingEditsAfterKeystroke is not supported for MDX files',
      )
    },

    getFormattingEditsForDocument(fileName, options) {
      if (!isMdx(fileName)) {
        return ls.getFormattingEditsForDocument(fileName, options)
      }

      throw new Error(
        'getFormattingEditsForDocument is not supported for MDX files',
      )
    },

    getFormattingEditsForRange(fileName, start, end, options) {
      if (!isMdx(fileName)) {
        return ls.getFormattingEditsForRange(fileName, start, end, options)
      }

      throw new Error(
        'getFormattingEditsForRange is not supported for MDX files',
      )
    },

    getImplementationAtPosition(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getImplementationAtPosition(fileName, position)
      }

      throw new Error(
        'getImplementationAtPosition is not supported for MDX files',
      )
    },

    getIndentationAtPosition(fileName, position, options) {
      if (!isMdx(fileName)) {
        return ls.getIndentationAtPosition(fileName, position, options)
      }

      throw new Error('getIndentationAtPosition is not supported for MDX files')
    },

    getJsxClosingTagAtPosition(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getJsxClosingTagAtPosition(fileName, position)
      }

      throw new Error(
        'getJsxClosingTagAtPosition is not supported for MDX files',
      )
    },

    getNameOrDottedNameSpan(fileName, startPos, endPos) {
      if (!isMdx(fileName)) {
        return ls.getNameOrDottedNameSpan(fileName, startPos, endPos)
      }

      throw new Error('getNameOrDottedNameSpan is not supported for MDX files')
    },

    getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles) {
      if (fileName && !isMdx(fileName)) {
        return ls.getNavigateToItems(
          searchValue,
          maxResultCount,
          fileName,
          excludeDtsFiles,
        )
      }

      throw new Error('getNavigateToItems is not supported for MDX files')
    },

    getNavigationBarItems(fileName) {
      if (!isMdx(fileName)) {
        return ls.getNavigationBarItems(fileName)
      }

      throw new Error('getNavigationBarItems is not supported for MDX files')
    },

    getNavigationTree(fileName) {
      if (!isMdx(fileName)) {
        return ls.getNavigationTree(fileName)
      }

      throw new Error('getNavigationTree is not supported for MDX files')
    },

    getOccurrencesAtPosition(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getOccurrencesAtPosition(fileName, position)
      }

      throw new Error('getOccurrencesAtPosition is not supported for MDX files')
    },

    getOutliningSpans(fileName) {
      if (!isMdx(fileName)) {
        return ls.getOutliningSpans(fileName)
      }

      throw new Error('getOutliningSpans is not supported for MDX files')
    },

    getProgram() {
      return ls.getProgram()
    },

    getQuickInfoAtPosition(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getQuickInfoAtPosition(fileName, position)
      }

      const snapshot = host.getScriptSnapshot(fileName)

      if (!snapshot) {
        return
      }

      const quickInfo =
        ls.getQuickInfoAtPosition(fileName, position) ||
        ls.getQuickInfoAtPosition(fileName, getJSXPosition(snapshot, position))

      if (quickInfo) {
        patchTextSpan(fileName, snapshot, quickInfo.textSpan)
        return quickInfo
      }

      const node = getMarkdownDefinitionAtPosition(
        processor.parse(snapshot.getText(0, snapshot.getLength())),
        position,
      )

      if (!node?.position) {
        return
      }

      /** @type {import('typescript').SymbolDisplayPart[]} */
      const displayParts = [
        { text: '[', kind: 'punctuation' },
        { text: node.identifier, kind: 'aliasName' },
        { text: ']', kind: 'punctuation' },
        { text: ':', kind: 'punctuation' },
        { text: ' ', kind: 'space' },
        { text: node.url, kind: 'aliasName' },
      ]
      if (node.title) {
        displayParts.push(
          { text: ' ', kind: 'space' },
          { text: JSON.stringify(node.title), kind: 'stringLiteral' },
        )
      }
      return {
        kind: ts.ScriptElementKind.linkName,
        kindModifiers: 'asd',
        textSpan: unistPositionToTextSpan(node.position),
        displayParts,
      }
    },

    getReferencesAtPosition(fileName, position) {
      const referenceEntries = ls.getReferencesAtPosition(fileName, position)

      if (referenceEntries) {
        patchDocumentSpans(referenceEntries)
      }

      return referenceEntries
    },

    getRenameInfo(fileName, position, options) {
      if (!isMdx(fileName)) {
        return ls.getRenameInfo(fileName, position, options)
      }

      throw new Error('getRenameInfo is not supported for MDX files')
    },

    getSemanticClassifications(fileName, span) {
      if (isMdx(fileName)) {
        throw new Error(
          'getSemanticClassifications is not supported for MDX files',
        )
      }

      return ls.getSemanticClassifications(fileName, span)
    },

    getSemanticDiagnostics(fileName) {
      const diagnostics = ls.getSemanticDiagnostics(fileName)

      for (const diagnostic of diagnostics) {
        patchDiagnostic(diagnostic)
      }

      return diagnostics
    },

    getSignatureHelpItems(fileName, position, options) {
      if (!isMdx(fileName)) {
        return ls.getSignatureHelpItems(fileName, position, options)
      }

      throw new Error('getSignatureHelpItems is not supported for MDX files')
    },

    getSmartSelectionRange(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getSmartSelectionRange(fileName, position)
      }

      throw new Error('getSmartSelectionRange is not supported for MDX files')
    },

    getSpanOfEnclosingComment(fileName, position, onlyMultiLine) {
      if (!isMdx(fileName)) {
        return ls.getSpanOfEnclosingComment(fileName, position, onlyMultiLine)
      }

      throw new Error(
        'getSpanOfEnclosingComment is not supported for MDX files',
      )
    },

    getSuggestionDiagnostics(fileName) {
      const diagnostics = ls.getSuggestionDiagnostics(fileName)

      for (const diagnostic of diagnostics) {
        patchDiagnostic(diagnostic)
      }

      return diagnostics
    },

    getSyntacticClassifications(fileName, span) {
      if (!isMdx(fileName)) {
        return ls.getSyntacticClassifications(fileName, span)
      }

      throw new Error(
        'getSyntacticClassifications is not supported for MDX files',
      )
    },

    getSyntacticDiagnostics(fileName) {
      const diagnostics = ls.getSyntacticDiagnostics(fileName)

      patchDiagnosticsWithLocation(diagnostics)

      return diagnostics
    },

    getTodoComments(fileName, descriptors) {
      if (!isMdx(fileName)) {
        return ls.getTodoComments(fileName, descriptors)
      }

      throw new Error('getTodoComments is not supported for MDX files')
    },

    getTypeDefinitionAtPosition(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.getTypeDefinitionAtPosition(fileName, position)
      }

      throw new Error(
        'getTypeDefinitionAtPosition is not supported for MDX files',
      )
    },

    isValidBraceCompletionAtPosition(fileName, position, openingBrace) {
      if (!isMdx(fileName)) {
        return ls.isValidBraceCompletionAtPosition(
          fileName,
          position,
          openingBrace,
        )
      }

      throw new Error(
        'isValidBraceCompletionAtPosition is not supported for MDX files',
      )
    },

    organizeImports(args, formatOptions, preferences) {
      if (!isMdx(args.fileName)) {
        return ls.organizeImports(args, formatOptions, preferences)
      }

      throw new Error('organizeImports is not supported for MDX files')
    },

    prepareCallHierarchy(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.prepareCallHierarchy(fileName, position)
      }

      throw new Error('prepareCallHierarchy is not supported for MDX files')
    },

    provideCallHierarchyIncomingCalls(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.provideCallHierarchyIncomingCalls(fileName, position)
      }

      throw new Error(
        'provideCallHierarchyIncomingCalls is not supported for MDX files',
      )
    },

    provideCallHierarchyOutgoingCalls(fileName, position) {
      if (!isMdx(fileName)) {
        return ls.provideCallHierarchyOutgoingCalls(fileName, position)
      }

      throw new Error(
        'provideCallHierarchyOutgoingCalls is not supported for MDX files',
      )
    },

    provideInlayHints(fileName, span, preferences) {
      if (!isMdx(fileName)) {
        return ls.provideInlayHints(fileName, span, preferences)
      }

      throw new Error('provideInlayHints is not supported for MDX files')
    },

    toggleLineComment(fileName, textRange) {
      if (!isMdx(fileName)) {
        return ls.toggleLineComment(fileName, textRange)
      }

      throw new Error('toggleLineComment is not supported for MDX files')
    },

    toggleMultilineComment(fileName, textRange) {
      if (!isMdx(fileName)) {
        return ls.toggleMultilineComment(fileName, textRange)
      }

      throw new Error('toggleMultilineComment is not supported for MDX files')
    },

    uncommentSelection(fileName, textRange) {
      if (!isMdx(fileName)) {
        return ls.uncommentSelection(fileName, textRange)
      }

      throw new Error('uncommentSelection is not supported for MDX files')
    },
  }
}
