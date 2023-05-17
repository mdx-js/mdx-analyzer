/**
 * @typedef {import('typescript')} ts
 * @typedef {import('typescript').CompilerOptions} CompilerOptions
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('typescript').LanguageServiceHost} LanguageServiceHost
 * @typedef {import('typescript').ProjectReference} ProjectReference
 */

import path from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {createMdxLanguageService} from '@mdx-js/language-service'
import {loadPlugins} from './configuration.js'
import {
  documents,
  getDocByFileName,
  getOrReadDocByFileName
} from './documents.js'

/**
 * Create a function for getting a script snapshot based on a TypeScript module.
 * @param {ts} ts
 *   The TypeScript module to use.
 * @returns {(fileName: string) => IScriptSnapshot | undefined}
 *   A function for getting a Script snapshot.
 */
function createGetScriptSnapshot(ts) {
  return (fileName) => {
    const doc = getOrReadDocByFileName(fileName)

    if (doc) {
      return ts.ScriptSnapshot.fromString(doc.getText())
    }
  }
}

/**
 * Get a list of the file paths of all open documents.
 *
 * @returns {string[]}
 *   The list of open documents.
 */
function getScriptFileNames() {
  return documents.keys().map((uri) => fileURLToPath(uri))
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

/**
 * Create a language service host that works with the language server.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {CompilerOptions} options
 *   The compiler options to use.
 * @param {readonly ProjectReference[]} [references]
 *   The compiler options to use.
 * @returns {LanguageServiceHost}
 *   A language service host that works with the language server.
 */
function createLanguageServiceHost(ts, options, references) {
  return {
    ...ts.sys,
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    getProjectReferences: () => references,
    getScriptSnapshot: createGetScriptSnapshot(ts),
    getScriptVersion,
    getScriptFileNames,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames
  }
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
 *   The default language service.
 */
function getDefaultLanguageService(ts) {
  if (!defaultLanguageService) {
    defaultLanguageService = createMdxLanguageService(
      ts,
      createLanguageServiceHost(ts, {
        allowJs: true,
        lib: ['lib.es2020.full.d.ts'],
        module: ts.ModuleKind.Node16,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.Latest
      })
    )
  }

  return defaultLanguageService
}

/**
 * Create a language service for the given file URI.
 *
 * @param {ts} ts
 *   The TypeScript module to use.
 * @param {string} configPath
 *   The path to the TypeScript configuration file.
 * @returns {Promise<LanguageService>}
 *   An MDX language service.
 */
async function createLanguageService(ts, configPath) {
  const jsonText = ts.sys.readFile(configPath)
  if (jsonText === undefined) {
    return getDefaultLanguageService(ts)
  }

  const {config, error} = ts.parseConfigFileTextToJson(configPath, jsonText)
  if (error || !config) {
    return getDefaultLanguageService(ts)
  }

  const plugins = await loadPlugins(path.dirname(configPath), config.mdx)

  const {options, projectReferences} = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    fileURLToPath(new URL('.', pathToFileURL(configPath))),
    {...ts.getDefaultCompilerOptions(), allowJs: true},
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

  return createMdxLanguageService(
    ts,
    createLanguageServiceHost(ts, options, projectReferences),
    plugins
  )
}

/** @type {Map<string, Promise<LanguageService>>} */
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
 * @returns {LanguageService | Promise<LanguageService>}
 *   A cached MDX language service.
 */
export function getOrCreateLanguageService(ts, uri) {
  const configPath = ts.findConfigFile(fileURLToPath(uri), ts.sys.fileExists)
  if (!configPath) {
    return getDefaultLanguageService(ts)
  }

  // It’s important this caching logic is synchronous. This is why we cache the
  // promise, not the value.
  let promise = cache.get(configPath)
  if (!promise) {
    promise = createLanguageService(ts, configPath)
    cache.set(configPath, promise)
  }

  return promise
}
