/**
 * @typedef {import('typescript')} ts
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 */

import {fileURLToPath, pathToFileURL} from 'node:url'

import {createMdxLanguageService} from '@mdx-js/language-service'

import {getDocByFileName} from './documents.js'

/**
 * Create a function for getting a script snapshot based on a TypeScript module.
 * @param {ts} ts
 *   The TypeScript module to use.
 * @returns {(fileName: string) => IScriptSnapshot | undefined}
 *   A function for getting a Script snapshot.
 */
function createGetScriptSnapshot(ts) {
  return (fileName) => {
    const doc = getDocByFileName(fileName)

    if (doc) {
      return ts.ScriptSnapshot.fromString(doc.getText())
    }

    const text = ts.sys.readFile(fileName)

    if (text) {
      return ts.ScriptSnapshot.fromString(text)
    }
  }
}

/**
 * Get the current script version of a file.
 *
 * If a file has previously been opened, it will be available in the document
 * registry. This will increment the version for every edit made.
 *
 * If a file isn’t available in the document registry, version 0 will be
 * returned.
 *
 * @param {string} fileName
 *   The file name to get the version for.
 * @returns {string}
 *   The script version.
 */
function getScriptVersion(fileName) {
  const doc = getDocByFileName(fileName)

  return doc ? String(doc.version) : '0'
}

/** @type {LanguageService} */
let defaultLanguageService

/**
 * Get the default language service.
 *
 * The default language service be used when a file is opened outside of a
 * TypeScript project. (No `tsconfig.json` is found.)
 *
 * The default language service is created once if needed, then reused.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @returns {LanguageService}
 *   The defaul language service.
 */
function getDefaultLanguageService(ts) {
  if (!defaultLanguageService) {
    defaultLanguageService = createMdxLanguageService(ts, {
      ...ts.sys,
      getCompilationSettings: () => ({
        lib: ['lib.es2020.full.d.ts'],
        module: ts.ModuleKind.Node16,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.Latest
      }),
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      getScriptSnapshot: createGetScriptSnapshot(ts),
      getScriptVersion,
      getScriptFileNames: () => [],
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames
    })
  }

  return defaultLanguageService
}

/** @type {Map<string, LanguageService>} */
const cache = new Map()

/**
 * Get or create a language service for the given file URI.
 *
 * The language service is cached per TypeScript project. A TypeScript project
 * is defined by a `tsconfig.json` file.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {string} uri
 *   The file URI for which to get the language service.
 * @returns {LanguageService}
 *   A cached TypeScript language service.
 */
export function getOrCreateLanguageService(ts, uri) {
  const configPath = ts.findConfigFile(fileURLToPath(uri), ts.sys.fileExists)
  if (!configPath) {
    return getDefaultLanguageService(ts)
  }

  let ls = cache.get(configPath)
  if (ls) {
    return ls
  }

  const jsonText = ts.sys.readFile(configPath)
  if (jsonText === undefined) {
    return getDefaultLanguageService(ts)
  }

  const {config, error} = ts.parseConfigFileTextToJson(configPath, jsonText)
  if (error || !config) {
    return getDefaultLanguageService(ts)
  }

  const {fileNames, options, projectReferences} = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    fileURLToPath(new URL('.', pathToFileURL(configPath))),
    ts.getDefaultCompilerOptions(),
    'tsconfig.json',
    undefined,
    [
      {
        extension: '.mdx',
        isMixedContent: true,
        scriptKind: ts.ScriptKind.JSX
      }
    ]
  )

  ls = createMdxLanguageService(ts, {
    ...ts.sys,
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    getProjectReferences: () => projectReferences,
    getScriptFileNames: () => fileNames,
    getScriptSnapshot: createGetScriptSnapshot(ts),
    getScriptVersion,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames
  })
  cache.set(configPath, ls)
  return ls
}
