/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').Diagnostic} Diagnostic
 * @typedef {import('typescript').DiagnosticWithLocation} DiagnosticWithLocation
 * @typedef {import('typescript').DocumentSpan} DocumentSpan
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('typescript').LanguageServiceHost} LanguageServiceHost
 * @typedef {import('typescript').NavigationBarItem} NavigationBarItem
 * @typedef {import('typescript').RenameLocation} RenameLocation
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
export function isMdx(fileName) {
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
 * @param {MDXSnapshot} snapshot
 *   The MDX TypeScript snapshot the text span belongs in.
 * @param {TextSpan | undefined} textSpan
 *   The text span to correct.
 * @returns {boolean}
 *   True if the original text span represents a real location in the document,
 *   otherwise false. If it’s false, the text span should be removed from the
 *   results.
 */
function patchTextSpan(snapshot, textSpan) {
  if (!textSpan) {
    return false
  }

  const realStart = snapshot.getRealPosition(textSpan.start)
  if (realStart === undefined) {
    return false
  }

  textSpan.start = realStart
  return true
}

/**
 * Correct the text spans in an MDX file.
 *
 * @param {MDXSnapshot} snapshot
 *   The MDX TypeScript snapshot that belongs to the file name.
 * @param {NavigationBarItem[]} items
 *   The navigation bar items to patch.
 */
function patchNavigationBarItem(snapshot, items) {
  return items.filter((item) => {
    item.spans = item.spans.filter((span) => patchTextSpan(snapshot, span))
    if (item.spans.length === 0) {
      return false
    }

    item.childItems = patchNavigationBarItem(snapshot, item.childItems)
    return true
  })
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
    // Tell TypeScript to treat MDX files as JSX (not JS nor TSX).
    if (isMdx(fileName)) {
      return ts.ScriptKind.JSX
    }

    // ScriptKind.Unknown tells TypeScript to resolve it internally.
    // https://github.com/microsoft/TypeScript/blob/v4.9.4/src/compiler/utilities.ts#L6968
    // Note that ScriptKind.Unknown is 0, so it’s falsy.
    // https://github.com/microsoft/TypeScript/blob/v4.9.4/src/compiler/types.ts#L6750
    return host.getScriptKind?.(fileName) ?? ts.ScriptKind.Unknown
  }

  // `getScriptSnapshot` and `getScriptVersion` handle file synchronization in
  // the TypeScript language service and play closely together. Before every
  // method invocation, the language service synchronizes files. At first, it
  // checks the snapshot version. If this is unchanged, it uses the existing
  // snapshot. Otherwise it will request a new snapshot.
  //
  // The MDX language service hooks into this mechanism to handle conversion of
  // MDX files to JSX, which TypeScript can handle.
  internalHost.getScriptSnapshot = (fileName) => {
    // For non-MDX files, there’s no need to perform any MDX specific
    // synchronization.
    if (!isMdx(fileName)) {
      return host.getScriptSnapshot(fileName)
    }

    return getMdxSnapshot(fileName)
  }

  internalHost.getScriptVersion = (fileName) => {
    const externalVersion = host.getScriptVersion(fileName)
    // Since we’re only interested in processing MDX files, we can just forward
    // non-MDX snapshot versions.
    if (!isMdx(fileName)) {
      return externalVersion
    }

    const internalVersion = scriptVersions.get(fileName)
    // If the external version is different from the internal, this means the
    // file was updates, so we need to clear the cached snapshot.
    if (externalVersion !== internalVersion) {
      scriptSnapshots.delete(fileName)
      scriptVersions.set(fileName, externalVersion)
    }

    return externalVersion
  }

  // When resolving an MDX file, TypeScript will try to resolve a file with the
  // `.jsx` file extension. Here we make sure to work around that.
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
   * @returns {MDXSnapshot | undefined}
   */
  function getMdxSnapshot(fileName) {
    const snapshot = scriptSnapshots.get(fileName)
    // `getScriptVersion` below deletes the snapshot if the version is outdated.
    // So if the snapshot exists at this point, this means it’s ok to return
    // as-is.
    if (snapshot) {
      return snapshot
    }

    // If there is am existing snapshot, we need to synchronize from the host.
    const externalSnapshot = host.getScriptSnapshot(fileName)
    if (!externalSnapshot) {
      return
    }

    // Here we use the snapshot from the original host. Since this has MDX
    // content, we need to convert it to JSX.
    const length = externalSnapshot.getLength()
    const mdx = externalSnapshot.getText(0, length)
    const newSnapshot = mdxToJsx(mdx, processor)
    newSnapshot.dispose = () => {
      externalSnapshot.dispose?.()
      scriptSnapshots.delete(fileName)
      scriptVersions.delete(fileName)
    }

    // It’s cached, so we only need to convert the MDX to JSX once.
    scriptSnapshots.set(fileName, newSnapshot)
    return newSnapshot
  }

  /**
   * Synchronize a snapshot with the external host.
   *
   * This function should be called first in every language service method
   * pverride.
   *
   * @param {string} fileName
   *   The file name to synchronize.
   * @returns {MDXSnapshot | undefined}
   *   The synchronized MDX snapshot.
   */
  function syncSnapshot(fileName) {
    // If it’s not an MDX file, there’s nothing to do.
    if (!isMdx(fileName)) {
      return
    }

    // If the internal and external snapshot versions are the same, and a
    // snapshot is present, this means it’s up-to-date, so there’s no need to
    // sychronize.
    const snapshot = getMdxSnapshot(fileName)
    const externalVersion = host.getScriptVersion(fileName)
    const internalVersion = scriptVersions.get(fileName)
    if (internalVersion === externalVersion && snapshot) {
      return snapshot
    }

    // If there is am existing snapshot, we need to synchronize from the host.
    const externalSnapshot = host.getScriptSnapshot(fileName)
    if (!externalSnapshot) {
      return
    }

    // Here we use the snapshot from the original host. Since this has MDX
    // content, we need to convert it to JSX.
    const length = externalSnapshot.getLength()
    const mdx = externalSnapshot.getText(0, length)
    const newSnapshot = mdxToJsx(mdx, processor)
    newSnapshot.dispose = () => {
      externalSnapshot.dispose?.()
      scriptSnapshots.delete(fileName)
      scriptVersions.delete(fileName)
    }

    // It’s cached, so we only need to convert the MDX to JSX once.  Also the
    // version is cached for later comparison.
    scriptSnapshots.set(fileName, newSnapshot)
    scriptVersions.set(fileName, externalVersion)
    return newSnapshot
  }

  /**
   * @template {DocumentSpan} T
   * @param {readonly T[]} documentSpans
   * @returns {T[]}
   */
  function patchDocumentSpans(documentSpans) {
    /** @type {T[]} */
    const result = []
    for (const documentSpan of documentSpans) {
      if (isMdx(documentSpan.fileName)) {
        const snapshot = getMdxSnapshot(documentSpan.fileName)
        if (!snapshot) {
          // This should never occur
          continue
        }

        if (!patchTextSpan(snapshot, documentSpan.textSpan)) {
          continue
        }

        if (!patchTextSpan(snapshot, documentSpan.contextSpan)) {
          delete documentSpan.contextSpan
        }
      }

      result.push(documentSpan)

      if (
        !documentSpan.originalFileName ||
        !isMdx(documentSpan.originalFileName)
      ) {
        continue
      }

      const originalSnapshot = getMdxSnapshot(documentSpan.originalFileName)
      if (originalSnapshot) {
        if (
          !patchTextSpan(originalSnapshot, documentSpan.originalContextSpan)
        ) {
          delete documentSpan.originalContextSpan
        }

        if (!patchTextSpan(originalSnapshot, documentSpan.originalTextSpan)) {
          delete documentSpan.originalTextSpan
        }
      }
    }

    return result
  }

  /**
   * @param {Diagnostic} diagnostic
   */
  function patchDiagnostic(diagnostic) {
    const fileName = diagnostic.file?.fileName
    if (!fileName || !isMdx(fileName)) {
      return
    }

    const snapshot = getMdxSnapshot(fileName)

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

      if (!locations) {
        return
      }

      /** @type {RenameLocation[]} */
      const result = []
      for (const location of locations) {
        if (isMdx(location.fileName)) {
          const locationSnapshot = getMdxSnapshot(location.fileName)
          if (!locationSnapshot) {
            // This should never occur!
            continue
          }

          if (!patchTextSpan(locationSnapshot, location.textSpan)) {
            continue
          }

          if (!patchTextSpan(locationSnapshot, location.contextSpan)) {
            delete location.contextSpan
          }
        }

        result.push(location)
      }

      return locations
    },

    getApplicableRefactors: notImplemented('getApplicableRefactors'),

    getBraceMatchingAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)
      const textSpans = ls.getBraceMatchingAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
      )

      if (!snapshot) {
        return textSpans
      }

      return textSpans.filter((textSpan) => patchTextSpan(snapshot, textSpan))
    },

    getBreakpointStatementAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)
      const textSpan = ls.getBreakpointStatementAtPosition(fileName, position)

      if (!textSpan) {
        return
      }

      if (snapshot) {
        patchTextSpan(snapshot, textSpan)
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

      if (!completionInfo) {
        return
      }

      if (snapshot) {
        if (!patchTextSpan(snapshot, completionInfo.optionalReplacementSpan)) {
          delete completionInfo.optionalReplacementSpan
        }

        if (completionInfo.entries) {
          for (const entry of completionInfo.entries) {
            if (!patchTextSpan(snapshot, entry.replacementSpan)) {
              delete entry.replacementSpan
            }
          }
        }
      }

      return completionInfo
    },

    getDefinitionAndBoundSpan: notImplemented('getDefinitionAndBoundSpan'),

    getDefinitionAtPosition(fileName, position) {
      const snapshot = syncSnapshot(fileName)

      let definition = ls.getDefinitionAtPosition(
        fileName,
        snapshot?.getShadowPosition(position) ?? position
      )

      if (definition) {
        definition = patchDocumentSpans(definition)
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
      const navigationBarItems = ls.getNavigationBarItems(fileName)

      if (snapshot) {
        return patchNavigationBarItem(snapshot, navigationBarItems)
      }

      return navigationBarItems
    },

    getNavigationTree: notImplemented('getNavigationTree'),
    getOccurrencesAtPosition: notImplemented('getOccurrencesAtPosition'),

    getOutliningSpans(fileName) {
      const snapshot = syncSnapshot(fileName)
      const outliningSpans = ls.getOutliningSpans(fileName)

      if (!snapshot) {
        return outliningSpans
      }

      const results = getFoldingRegions(ts, snapshot.ast)
      for (const span of outliningSpans) {
        if (!patchTextSpan(snapshot, span.textSpan)) {
          continue
        }

        if (!patchTextSpan(snapshot, span.hintSpan)) {
          continue
        }

        results.push(span)
      }

      return results.sort(
        (a, b) =>
          a.textSpan.start - b.textSpan.start ||
          a.textSpan.length - b.textSpan.length ||
          a.kind.localeCompare(b.kind)
      )
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

      if (!snapshot) {
        return quickInfo
      }

      if (quickInfo && patchTextSpan(snapshot, quickInfo.textSpan)) {
        return quickInfo
      }

      const node = getMarkdownDefinitionAtPosition(snapshot.ast, position)

      if (!node?.position) {
        return
      }

      /** @type {SymbolDisplayPart[]} */
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

      if (snapshot && info.canRename) {
        if (patchTextSpan(snapshot, info.triggerSpan)) {
          return info
        }

        return {
          canRename: false,
          localizedErrorMessage:
            'Could not map the rename info to the MDX source'
        }
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
        return patchDocumentSpans(definition)
      }
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
