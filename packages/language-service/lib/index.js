/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').Diagnostic} Diagnostic
 * @typedef {import('typescript').DiagnosticWithLocation} DiagnosticWithLocation
 * @typedef {import('typescript').DocumentSpan} DocumentSpan
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('typescript').LanguageServiceHost} LanguageServiceHost
 * @typedef {import('typescript').NavigationBarItem} NavigationBarItem
 * @typedef {import('typescript').SymbolDisplayPart} SymbolDisplayPart
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('./utils.js').MDXSnapshot} MDXSnapshot
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'

import {toDiagnostic} from './error.js'
import {getMarkdownDefinitionAtPosition} from './markdown.js'
import {bindAll} from './object.js'
import {getFoldingRegions} from './outline.js'
import {fakeMdxPath} from './path.js'
import {mdxToJsx, unistPositionToTextSpan} from './utils.js'

/**
 * Check whether a file is an MDX file based on its file name.
 *
 * @param {string} fileName
 *   The file name to check.
 * @returns {fileName is `${string}.mdx`}
 *   Whether or not the filename contains MDX.
 */
function isMdx(fileName) {
  return fileName.endsWith('.mdx')
}

/**
 * Assert that a file isn’t MDX.
 *
 * @param {string} fileName
 *   The file name to check.
 * @param {string} fn
 *   The name of the function.
 */
function assertNotMdx(fileName, fn) {
  if (isMdx(fileName)) {
    throw new Error(`${fn} is not supported for MDX files`)
  }
}

/**
 * Correct the MDX position of a text span for MDX files.
 *
 * @param {string} fileName
 *   The file name of the snapshot the text span belongs in.
 * @param {MDXSnapshot | undefined} snapshot
 *   The MDX TypeScript snapshot that belongs to the file name.
 * @param {TextSpan} textSpan
 *   The text span to correct.
 */
function patchTextSpan(fileName, snapshot, textSpan) {
  if (snapshot && isMdx(fileName)) {
    textSpan.start = snapshot.getRealPosition(textSpan.start)
  }
}

/**
 * Correct the text spans in an MDX file.
 *
 * @param {string} fileName
 *   The file name of the snapshot the text span belongs in.
 * @param {MDXSnapshot} snapshot
 *   The MDX TypeScript snapshot that belongs to the file name.
 * @param {NavigationBarItem} item
 *   The navigation bar item to patch.
 */
function patchNavigationBarItem(fileName, snapshot, item) {
  for (const span of item.spans) {
    patchTextSpan(fileName, snapshot, span)
  }

  for (const child of item.childItems) {
    patchNavigationBarItem(fileName, snapshot, child)
  }
}

/**
 * Create an MDX language service.
 *
 * The MDX language service wraps a TypeScript language service, but it can also
 * handle MDX files.
 *
 * Most implementations work as follows:
 *
 * 1. Convert MDX code to JavaScript.
 * 2. Let TypeScript process the JavaScript.
 * 3. Convert any positional info back to its original location.
 *
 * In addition it supports some markdown features.
 *
 * @param {import('typescript')} ts
 *   The TypeScript module to use for creating the TypeScript language service.
 * @param {LanguageServiceHost} host
 *   The TypeScript language service host. See
 *   https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#language-service-host
 * @param {PluggableList} [plugins]
 *   A list of remark plugins. Only syntax parser plugins are supported. For
 *   example `remark-frontmatter`, but not `remark-mdx-frontmatter`
 * @returns {LanguageService}
 *   A TypeScript language service that can also handle MDX files.
 */
export function createMdxLanguageService(ts, host, plugins) {
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
    // Default to the JSX automatic runtime, because that’s what MDX does.
    jsx: ts.JsxEmit.ReactJSX,
    // Set these defaults to match MDX if the user explicitly sets the classic runtime.
    jsxFactory: 'React.createElement',
    jsxFragmentFactory: 'React.Fragment',
    // Set this default to match MDX if the user overrides the import source.
    jsxImportSource: 'react',
    ...host.getCompilationSettings(),
    // Always allow JS for type checking.
    allowJs: true,
    // This internal TypeScript property lets TypeScript load `.mdx` files.
    allowNonTsExtensions: true
  })

  internalHost.getScriptKind = (fileName) => {
    if (isMdx(fileName)) {
      return ts.ScriptKind.JSX
    }

    return host.getScriptKind?.(fileName) ?? ts.ScriptKind.JS
  }

  internalHost.getScriptSnapshot = (fileName) => {
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

  internalHost.getScriptVersion = (fileName) => {
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
    options
  ) =>
    moduleNames.map((moduleName) => {
      const resolvedModule = ts.resolveModuleName(
        moduleName,
        containingFile,
        options,
        {
          ...internalHost,
          readFile: (fileName) => host.readFile(fakeMdxPath(fileName)),
          fileExists: (fileName) => host.fileExists(fakeMdxPath(fileName))
        },
        undefined,
        redirectedReference
      ).resolvedModule

      if (resolvedModule) {
        resolvedModule.resolvedFileName = fakeMdxPath(
          resolvedModule.resolvedFileName
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
          documentSpan.originalFileName
        )

        if (documentSpan.originalContextSpan) {
          patchTextSpan(
            documentSpan.originalFileName,
            originalSnapshot,
            documentSpan.originalContextSpan
          )
        }

        if (documentSpan.originalTextSpan) {
          patchTextSpan(
            documentSpan.originalFileName,
            originalSnapshot,
            documentSpan.originalTextSpan
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

    if (diagnostic.start !== undefined) {
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
    applyCodeActionCommand(fileNameOrAction, formatSettignsOrAction) {
      // @ts-expect-error The deprecated function signature prevents proper type
      // safety.
      return ls.applyCodeActionCommand(fileNameOrAction, formatSettignsOrAction)
    },

    cleanupSemanticCache() {
      ls.cleanupSemanticCache()
    },

    commentSelection: notImplemented('commentSelection'),

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
      providePrefixAndSuffixTextForRename
    ) {
      const snapshot = syncSnapshot(fileName)
      const locations = ls.findRenameLocations(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        findInStrings,
        findInComments,
        providePrefixAndSuffixTextForRename
      )

      if (locations) {
        for (const location of locations) {
          const locationSnapshot = scriptSnapshots.get(location.fileName)
          patchTextSpan(location.fileName, locationSnapshot, location.textSpan)
          if (location.contextSpan) {
            patchTextSpan(
              location.fileName,
              locationSnapshot,
              location.contextSpan
            )
          }
        }
      }

      return locations
    },

    getApplicableRefactors: notImplemented('getApplicableRefactors'),

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

    getCodeFixesAtPosition: notImplemented('getCodeFixesAtPosition'),

    getCombinedCodeFix(scope, fixId, formatOptions, preferences) {
      assertNotMdx(scope.fileName, 'getCombinedCodeFix')
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
      data
    ) {
      const snapshot = syncSnapshot(fileName)
      return ls.getCompletionEntryDetails(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        entryName,
        formatOptions,
        source,
        preferences,
        data
      )
    },

    getCompletionEntrySymbol: notImplemented('getCompletionEntrySymbol'),

    getCompletionsAtPosition(fileName, position, options, formattingSettings) {
      const snapshot = syncSnapshot(fileName)
      const completionInfo = ls.getCompletionsAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position,
        options,
        formattingSettings
      )
      if (!isMdx(fileName) || !snapshot || !completionInfo) {
        return completionInfo
      }

      if (completionInfo.optionalReplacementSpan) {
        patchTextSpan(
          fileName,
          snapshot,
          completionInfo.optionalReplacementSpan
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

    getDefinitionAndBoundSpan: notImplemented('getDefinitionAndBoundSpan'),

    getDefinitionAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)

      const definition = ls.getDefinitionAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
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
              containerName: fileName
            }
          ]
        }
      }

      return definition
    },

    getDocCommentTemplateAtPosition: notImplemented(
      'getDocCommentTemplateAtPosition'
    ),
    getDocumentHighlights: notImplemented('getDocumentHighlights'),

    getEditsForFileRename(
      oldFilePath,
      newFilePath,
      formatOptions,
      preferences
    ) {
      assertNotMdx(newFilePath, 'getEditsForRefactor')
      return ls.getEditsForFileRename(
        oldFilePath,
        newFilePath,
        formatOptions,
        preferences
      )
    },

    getEditsForRefactor: notImplemented('getEditsForRefactor'),
    getEmitOutput: notImplemented('getEmitOutput'),
    getEncodedSemanticClassifications: notImplemented(
      'getEncodedSemanticClassifications'
    ),
    getEncodedSyntacticClassifications: notImplemented(
      'getEncodedSyntacticClassifications'
    ),
    getFileReferences: notImplemented('getFileReferences'),
    getFormattingEditsAfterKeystroke: notImplemented(
      'getFormattingEditsAfterKeystroke'
    ),
    getFormattingEditsForDocument: notImplemented(
      'getFormattingEditsForDocument'
    ),
    getFormattingEditsForRange: notImplemented('getFormattingEditsForRange'),
    getImplementationAtPosition: notImplemented('getImplementationAtPosition'),
    getIndentationAtPosition: notImplemented('getIndentationAtPosition'),
    getJsxClosingTagAtPosition: notImplemented('getJsxClosingTagAtPosition'),
    getNameOrDottedNameSpan: notImplemented('getNameOrDottedNameSpan'),

    getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles) {
      if (fileName) {
        assertNotMdx(fileName, 'getNavigateToItems')
      }

      return ls.getNavigateToItems(
        searchValue,
        maxResultCount,
        fileName,
        excludeDtsFiles
      )
    },

    getNavigationBarItems(fileName) {
      const snapshot = syncSnapshot(fileName)
      let navigationBarItems = ls.getNavigationBarItems(fileName)

      if (isMdx(fileName)) {
        navigationBarItems = navigationBarItems.filter(
          (item) => item.text !== 'MDXContent'
        )
      }

      if (snapshot) {
        for (const item of navigationBarItems) {
          patchNavigationBarItem(fileName, snapshot, item)
        }
      }

      return navigationBarItems
    },

    getNavigationTree: notImplemented('getNavigationTree'),
    getOccurrencesAtPosition: notImplemented('getOccurrencesAtPosition'),

    getOutliningSpans(fileName) {
      const snapshot = syncSnapshot(fileName)
      const outliningSpans = ls.getOutliningSpans(fileName)

      for (const span of outliningSpans) {
        patchTextSpan(fileName, snapshot, span.hintSpan)
        patchTextSpan(fileName, snapshot, span.textSpan)
      }

      if (snapshot) {
        outliningSpans.push(...getFoldingRegions(ts, snapshot.ast))
      }

      return outliningSpans
    },

    getProgram() {
      return ls.getProgram()
    },

    getQuickInfoAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)

      const quickInfo = ls.getQuickInfoAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
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
        {text: '[', kind: 'punctuation'},
        {text: node.identifier, kind: 'aliasName'},
        {text: ']', kind: 'punctuation'},
        {text: ':', kind: 'punctuation'},
        {text: ' ', kind: 'space'},
        {text: node.url, kind: 'aliasName'}
      ]
      if (node.title) {
        displayParts.push(
          {text: ' ', kind: 'space'},
          {text: JSON.stringify(node.title), kind: 'stringLiteral'}
        )
      }

      return {
        kind: ts.ScriptElementKind.linkName,
        kindModifiers: 'asd',
        textSpan: unistPositionToTextSpan(node.position),
        displayParts
      }
    },

    getReferencesAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)
      const referenceEntries = ls.getReferencesAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
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
        options
      )

      if (info.canRename) {
        patchTextSpan(fileName, snapshot, info.triggerSpan)
      }

      return info
    },

    getSemanticClassifications: notImplemented('getSemanticClassifications'),

    getSemanticDiagnostics(fileName) {
      syncSnapshot(fileName)
      const diagnostics = ls.getSemanticDiagnostics(fileName)

      for (const diagnostic of diagnostics) {
        patchDiagnostic(diagnostic)
      }

      return diagnostics
    },

    getSignatureHelpItems: notImplemented('getSignatureHelpItems'),
    getSmartSelectionRange: notImplemented('getSmartSelectionRange'),
    getSpanOfEnclosingComment: notImplemented('getSpanOfEnclosingComment'),

    getSuggestionDiagnostics(fileName) {
      syncSnapshot(fileName)
      const diagnostics = ls.getSuggestionDiagnostics(fileName)

      for (const diagnostic of diagnostics) {
        patchDiagnostic(diagnostic)
      }

      return diagnostics
    },

    getSyntacticClassifications: notImplemented('getSyntacticClassifications'),

    getSyntacticDiagnostics(fileName) {
      const snapshot = syncSnapshot(fileName)
      if (snapshot?.error) {
        return toDiagnostic(ts, snapshot.error)
      }

      const diagnostics = ls.getSyntacticDiagnostics(fileName)

      patchDiagnosticsWithLocation(diagnostics)

      return diagnostics
    },

    getTodoComments: notImplemented('getTodoComments'),

    getTypeDefinitionAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)

      const definition = ls.getDefinitionAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
      )

      if (definition) {
        patchDocumentSpans(definition)
      }

      return definition
    },

    isValidBraceCompletionAtPosition: notImplemented(
      'isValidBraceCompletionAtPosition'
    ),

    organizeImports(args, formatOptions, preferences) {
      assertNotMdx(args.fileName, 'organizeImports')
      return ls.organizeImports(args, formatOptions, preferences)
    },

    prepareCallHierarchy: notImplemented('prepareCallHierarchy'),
    provideCallHierarchyIncomingCalls: notImplemented(
      'provideCallHierarchyIncomingCalls'
    ),
    provideCallHierarchyOutgoingCalls: notImplemented(
      'provideCallHierarchyOutgoingCalls'
    ),
    provideInlayHints: notImplemented('provideInlayHints'),
    toggleLineComment: notImplemented('toggleLineComment'),
    toggleMultilineComment: notImplemented('toggleMultilineComment'),
    uncommentSelection: notImplemented('uncommentSelection')
  }

  /**
   * Mark a method as not implemented for MDX files.
   *
   * This returns a function that can process JavaScript or TypeScript files,
   * but will throw an error if given an MDX file.
   *
   * This only works for calls that take a file name as their first argument.
   *
   * @template {keyof LanguageService} T
   *   The name of the method.
   * @param {T} name
   *   The name of the method.
   * @returns {LanguageService[T]}
   *   A function that wraps the original language service method.
   */
  function notImplemented(name) {
    // @ts-expect-error
    return (fileName, ...args) => {
      assertNotMdx(fileName, name)
      // @ts-expect-error
      return ls[name](fileName, ...args)
    }
  }
}
