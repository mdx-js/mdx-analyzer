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
 * @typedef {import('./utils.js').MDXSnapshot} MDXSnapshot
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { toDiagnostic } from './error.js'
import { getMarkdownDefinitionAtPosition } from './markdown.js'
import { bindAll } from './object.js'
import { fakeMdxPath } from './path.js'
import { mdxToJsx, unistPositionToTextSpan } from './utils.js'

/**
 * @param {string} fileName
 * @returns {fileName is `${string}.mdx`} Whether or not the filename contains MDX.
 */
function isMdx(fileName) {
  return fileName.endsWith('.mdx')
}

/**
 * @param {string} fileName
 * @param {MDXSnapshot | undefined} snapshot
 * @param {TextSpan} textSpan
 */
function patchTextSpan(fileName, snapshot, textSpan) {
  if (snapshot && isMdx(fileName)) {
    textSpan.start = snapshot.getRealPosition(textSpan.start)
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

  /** @type {Map<string, string>} */
  const scriptVersions = new Map()
  /** @type {Map<string, MDXSnapshot>} */
  const scriptSnapshots = new Map()
  const internalHost = bindAll(host)

  internalHost.getCompilationSettings = () => ({
    jsx: ts.JsxEmit.Preserve,
    ...host.getCompilationSettings(),
    allowJs: true,
    allowNonTsExtensions: true,
  })

  internalHost.getScriptKind = fileName => {
    if (isMdx(fileName)) {
      return ts.ScriptKind.JSX
    }
    return host.getScriptKind?.(fileName) ?? ts.ScriptKind.JS
  }

  internalHost.getScriptSnapshot = fileName => {
    if (!isMdx(fileName)) {
      return host.getScriptSnapshot(fileName)
    }

    const snapshot = scriptSnapshots.get(fileName)
    if (snapshot) {
      return snapshot
    }

    const externalSnapshot = host.getScriptSnapshot(fileName)
    if (!externalSnapshot) {
      return
    }

    const length = externalSnapshot.getLength()
    const mdx = externalSnapshot.getText(0, length)
    const newSnapshot = mdxToJsx(mdx, processor)
    newSnapshot.dispose = () => {
      externalSnapshot.dispose?.()
      scriptSnapshots.delete(fileName)
      scriptVersions.delete(fileName)
    }
    scriptSnapshots.set(fileName, newSnapshot)
    return newSnapshot
  }

  internalHost.getScriptVersion = fileName => {
    const externalVersion = host.getScriptVersion(fileName)
    if (!isMdx(fileName)) {
      return externalVersion
    }
    const internalVersion = scriptVersions.get(fileName)
    if (externalVersion !== internalVersion) {
      scriptSnapshots.delete(fileName)
      scriptVersions.set(fileName, externalVersion)
    }
    return externalVersion
  }

  internalHost.resolveModuleNames = (
    moduleNames,
    containingFile,
    _reusedNames,
    redirectedReference,
    options,
  ) =>
    moduleNames.map(moduleName => {
      const resolvedModule = ts.resolveModuleName(
        moduleName,
        containingFile,
        options,
        {
          ...internalHost,
          readFile: fileName => host.readFile(fakeMdxPath(fileName)),
          fileExists: fileName => host.fileExists(fakeMdxPath(fileName)),
        },
        undefined,
        redirectedReference,
      ).resolvedModule

      if (resolvedModule) {
        resolvedModule.resolvedFileName = fakeMdxPath(
          resolvedModule.resolvedFileName,
        )
      }

      return resolvedModule
    })

  const ls = ts.createLanguageService(internalHost)

  /**
   * @param {string} fileName
   * @returns {MDXSnapshot | undefined} The synchronized MDX snapshot.
   */
  function syncSnapshot(fileName) {
    if (!isMdx(fileName)) {
      return
    }
    const snapshot = scriptSnapshots.get(fileName)
    const externalVersion = host.getScriptVersion(fileName)
    const internalVersion = scriptVersions.get(fileName)
    if (internalVersion === externalVersion && snapshot) {
      return snapshot
    }

    const externalSnapshot = host.getScriptSnapshot(fileName)
    if (!externalSnapshot) {
      return
    }

    const length = externalSnapshot.getLength()
    const mdx = externalSnapshot.getText(0, length)
    const newSnapshot = mdxToJsx(mdx, processor)
    newSnapshot.dispose = () => {
      externalSnapshot.dispose?.()
      scriptSnapshots.delete(fileName)
      scriptVersions.delete(fileName)
    }
    scriptSnapshots.set(fileName, newSnapshot)
    scriptVersions.set(fileName, externalVersion)
    return newSnapshot
  }

  /**
   * @param {readonly DocumentSpan[]} documentSpans
   */
  function patchDocumentSpans(documentSpans) {
    for (const documentSpan of documentSpans) {
      const snapshot = scriptSnapshots.get(documentSpan.fileName)
      patchTextSpan(documentSpan.fileName, snapshot, documentSpan.textSpan)

      if (documentSpan.contextSpan) {
        patchTextSpan(documentSpan.fileName, snapshot, documentSpan.contextSpan)
      }

      if (documentSpan.originalFileName) {
        const originalSnapshot = scriptSnapshots.get(
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

    const snapshot = scriptSnapshots.get(fileName)

    if (!snapshot) {
      return
    }

    if (diagnostic.start != null) {
      diagnostic.start = snapshot.getRealPosition(diagnostic.start)
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
      const snapshot = syncSnapshot(fileName)
      const locations = ls.findRenameLocations(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        findInStrings,
        findInComments,
        providePrefixAndSuffixTextForRename,
      )

      if (locations) {
        for (const location of locations) {
          const locationSnapshot = scriptSnapshots.get(location.fileName)
          patchTextSpan(location.fileName, locationSnapshot, location.textSpan)
          if (location.contextSpan) {
            patchTextSpan(
              location.fileName,
              locationSnapshot,
              location.contextSpan,
            )
          }
        }
      }

      return locations

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
      const snapshot = syncSnapshot(fileName)
      const textSpans = ls.getBraceMatchingAtPosition(fileName, position)

      for (const textSpan of textSpans) {
        patchTextSpan(fileName, snapshot, textSpan)
      }

      return textSpans
    },

    getBreakpointStatementAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)
      const textSpan = ls.getBreakpointStatementAtPosition(fileName, position)

      if (!textSpan) {
        return
      }

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
      const snapshot = syncSnapshot(fileName)
      return ls.getCompletionEntryDetails(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
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
      const snapshot = syncSnapshot(fileName)
      const completionInfo = ls.getCompletionsAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        options,
        formattingSettings,
      )
      if (!isMdx(fileName) || !snapshot || !completionInfo) {
        return completionInfo
      }

      if (completionInfo.optionalReplacementSpan) {
        patchTextSpan(
          fileName,
          snapshot,
          completionInfo.optionalReplacementSpan,
        )
      }
      if (completionInfo.entries) {
        for (const entry of completionInfo.entries) {
          if (entry.replacementSpan) {
            patchTextSpan(fileName, snapshot, entry.replacementSpan)
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
      const snapshot = syncSnapshot(fileName)

      const definition = ls.getDefinitionAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
      )

      if (definition) {
        patchDocumentSpans(definition)
      }

      if (snapshot) {
        const node = getMarkdownDefinitionAtPosition(snapshot.ast, position)

        if (node?.position) {
          const result = definition ?? []
          return [
            ...result,
            {
              textSpan: unistPositionToTextSpan(node.position),
              fileName,
              kind: ts.ScriptElementKind.linkName,
              name: fileName,
              containerKind: ts.ScriptElementKind.linkName,
              containerName: fileName,
            },
          ]
        }
      }

      return definition
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
      const snapshot = syncSnapshot(fileName)

      const quickInfo = ls.getQuickInfoAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
      )

      if (quickInfo) {
        patchTextSpan(fileName, snapshot, quickInfo.textSpan)
        return quickInfo
      }

      if (!snapshot) {
        return
      }

      const node = getMarkdownDefinitionAtPosition(snapshot.ast, position)

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
      const snapshot = syncSnapshot(fileName)
      const referenceEntries = ls.getReferencesAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
      )

      if (referenceEntries) {
        patchDocumentSpans(referenceEntries)
      }

      return referenceEntries
    },

    getRenameInfo(fileName, position, options) {
      const snapshot = syncSnapshot(fileName)
      const info = ls.getRenameInfo(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        options,
      )

      if (info.canRename) {
        patchTextSpan(fileName, snapshot, info.triggerSpan)
      }

      return info
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
      syncSnapshot(fileName)
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
      syncSnapshot(fileName)
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
      const snapshot = syncSnapshot(fileName)
      if (snapshot?.error) {
        return toDiagnostic(ts, snapshot.error)
      }
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
      const snapshot = syncSnapshot(fileName)

      const definition = ls.getDefinitionAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
      )

      if (definition) {
        patchDocumentSpans(definition)
      }

      return definition
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
