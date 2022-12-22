/**
 * @typedef {import('typescript')} ts
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 */

import {fileURLToPath, pathToFileURL} from 'node:url'

import {createMDXLanguageService} from '@mdx-js/language-service'

import {getDocByFileName} from './documents.js'

/**
 * @param {ts} ts
 * @returns {(fileName: string) => IScriptSnapshot | undefined} XXX
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
 * @param {string} fileName
 * @returns {string} The script version
 */
function getScriptVersion(fileName) {
  const doc = getDocByFileName(fileName)

  return doc ? String(doc.version) : '0'
}

/** @type {LanguageService} */
let defaultLanguageService

/**
 * @param {ts} ts
 * @returns {LanguageService} XXX
 */
function getDefaultLanguageService(ts) {
  if (!defaultLanguageService) {
    defaultLanguageService = createMDXLanguageService(ts, {
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
 * @param {ts} ts
 * @param {string} uri
 * @returns {LanguageService} XXX
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

  ls = createMDXLanguageService(ts, {
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
