import type * as ts from 'typescript/lib/tsserverlibrary'

import { Logger } from '../logger'
import { isMdxFilePath } from '../utils'

export function decorateDiagnostics(
  ls: ts.LanguageService,
  logger: Logger,
): void {
  decorateSyntacticDiagnostics(ls)
  decorateSemanticDiagnostics(ls)
  decorateSuggestionDiagnostics(ls)
}

function decorateSyntacticDiagnostics(ls: ts.LanguageService): void {
  const getSyntacticDiagnostics = ls.getSyntacticDiagnostics
  ls.getSyntacticDiagnostics = (fileName: string) => {
    // Diagnostics inside Svelte files are done
    // by the svelte-language-server / Svelte for VS Code extension
    if (isMdxFilePath(fileName)) {
      return []
    }
    return getSyntacticDiagnostics(fileName)
  }
}

function decorateSemanticDiagnostics(ls: ts.LanguageService): void {
  const getSemanticDiagnostics = ls.getSemanticDiagnostics
  ls.getSemanticDiagnostics = (fileName: string) => {
    // Diagnostics inside Svelte files are done
    // by the svelte-language-server / Svelte for VS Code extension
    if (isMdxFilePath(fileName)) {
      return []
    }
    return getSemanticDiagnostics(fileName)
  }
}

function decorateSuggestionDiagnostics(ls: ts.LanguageService): void {
  const getSuggestionDiagnostics = ls.getSuggestionDiagnostics
  ls.getSuggestionDiagnostics = (fileName: string) => {
    // Diagnostics inside Svelte files are done
    // by the svelte-language-server / Svelte for VS Code extension
    if (isMdxFilePath(fileName)) {
      return []
    }
    return getSuggestionDiagnostics(fileName)
  }
}
