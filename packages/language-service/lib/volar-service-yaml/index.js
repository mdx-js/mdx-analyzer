/**
 * @typedef {import('@volar/language-service').Service} Service<undefined>
 * @typedef {import('@volar/language-service').TextDocument} TextDocument
 */

import {getLanguageService} from 'yaml-language-server/lib/umd/languageservice/yamlLanguageService.js'

/**
 * @param {TextDocument} document
 * @returns {boolean}
 */
function isYaml(document) {
  return document.languageId === 'yaml'
}

/**
 * @returns {undefined}
 */
function noop() {}

/**
 * @returns {Service}
 */
export function createYamlService() {
  return (context) => {
    const ls = getLanguageService({
      async schemaRequestService(uri) {
        if (uri.startsWith('file:') && context?.env.fs) {
          const result = await context?.env.fs.readFile(uri)
          if (result) {
            return result
          }

          throw new Error(`No such file: ${uri}`)
        }

        const response = await fetch(uri)
        if (response.ok) {
          return response.text()
        }

        throw new Error(await response.text())
      },
      telemetry: {
        send: noop,
        sendError: noop,
        sendTrack: noop
      },
      // @ts-expect-error https://github.com/redhat-developer/yaml-language-server/pull/910
      clientCapabilities: context?.env?.clientCapabilities,
      workspaceContext: {
        resolveRelativePath(relativePath, resource) {
          return String(new URL(relativePath, resource))
        }
      }
    })

    ls.configure({
      completion: true,
      customTags: [],
      format: true,
      hover: true,
      isKubernetes: false,
      validate: true,
      yamlVersion: '1.2'
    })

    return {
      provide: {},

      triggerCharacters: [' ', ':'],

      async provideCodeActions(document, range, context) {
        if (isYaml(document)) {
          return ls.getCodeAction(document, {
            context,
            range,
            textDocument: document
          })
        }
      },

      async provideCodeLenses(document) {
        if (isYaml(document)) {
          return ls.getCodeLens(document)
        }
      },

      async provideCompletionItems(document, position) {
        if (isYaml(document)) {
          return ls.doComplete(document, position, false)
        }
      },

      async provideDefinition(document, position) {
        if (isYaml(document)) {
          return ls.doDefinition(document, {position, textDocument: document})
        }
      },

      async provideDiagnostics(document) {
        if (isYaml(document)) {
          return ls.doValidation(document, false)
        }
      },

      async provideDocumentSymbols(document) {
        if (isYaml(document)) {
          return ls.findDocumentSymbols2(document, {})
        }
      },

      async provideHover(document, position) {
        if (isYaml(document)) {
          return ls.doHover(document, position)
        }
      },

      async provideDocumentLinks(document) {
        if (isYaml(document)) {
          return ls.findLinks(document)
        }
      },

      async provideFoldingRanges(document) {
        if (isYaml(document)) {
          return ls.getFoldingRanges(document, {})
        }
      },

      async provideOnTypeFormattingEdits(document, position, ch, options) {
        if (isYaml(document)) {
          return ls.doDocumentOnTypeFormatting(document, {
            ch,
            options,
            position,
            textDocument: document
          })
        }
      },

      async provideDocumentFormattingEdits(document) {
        if (isYaml(document)) {
          return ls.doFormat(document, {})
        }
      },

      async provideSelectionRanges(document, positions) {
        if (isYaml(document)) {
          return ls.getSelectionRanges(document, positions)
        }
      },

      async resolveCodeLens(codeLens) {
        return ls.resolveCodeLens(codeLens)
      }
    }
  }
}
