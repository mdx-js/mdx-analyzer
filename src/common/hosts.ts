import type * as ts from 'typescript/lib/tsserverlibrary'
import * as upath from 'upath'

import { AllowedTargetExtensions, ExtensionOptions } from './types'

export interface CreateParseConfigHostOptions {
  ts: typeof ts
  fromExtension: string
}

export function createParseConfigHost(
  options: CreateParseConfigHostOptions,
): ts.ParseConfigHost {
  const { fromExtension, ts } = options
  return {
    ...ts.sys,
    readDirectory: (rootDir, extensions, excludes, includes, depth) => {
      extensions = (extensions ?? []).concat(fromExtension)
      return ts.sys.readDirectory(
        rootDir,
        extensions,
        excludes,
        includes,
        depth,
      )
    },
  }
}

export interface ProxyFileOptions {
  getScriptFileNames(): string[]
  getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined
  getScriptVersion(fileName: string): string
}

export interface CreateLanguageServiceHostOptions extends ExtensionOptions {
  ts: typeof ts
  rootPath: string
  getOptions: () => ts.CompilerOptions
  getProxyFileOptions: () => ProxyFileOptions
}

export function createLanguageServiceHost(
  options: CreateLanguageServiceHostOptions,
) {
  const { ts, fromExtension, targetExtension, rootPath, getProxyFileOptions } =
    options

  const host: ts.LanguageServiceHost = {
    readFile: ts.sys.readFile,
    writeFile: ts.sys.writeFile,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    readDirectory: ts.sys.readDirectory,
    realpath: ts.sys.realpath,
    fileExists: ts.sys.fileExists,

    getScriptFileNames: getProxyFileOptions().getScriptFileNames,
    getScriptVersion: getProxyFileOptions().getScriptVersion,
    getScriptSnapshot: getProxyFileOptions().getScriptSnapshot,
    getDefaultLibFileName,
    getCurrentDirectory,
    getNewLine,
    useCaseSensitiveFileNames,
    getScriptKind,
    getCompilationSettings,
  }

  return host

  function getCurrentDirectory() {
    return rootPath
  }

  function getCompilationSettings() {
    return options.getOptions()
  }

  function getNewLine() {
    return ts.sys.newLine
  }

  function useCaseSensitiveFileNames() {
    return ts.sys.useCaseSensitiveFileNames
  }

  function getDefaultLibFileName(options: ts.CompilerOptions) {
    return ts.getDefaultLibFilePath(options)
  }

  function getScriptKind(fileName: string) {
    switch (upath.extname(fileName)) {
      case fromExtension:
        return targetExtensionToScriptKind(targetExtension)
      case ts.Extension.Js:
        return ts.ScriptKind.JS
      case ts.Extension.Jsx:
        return ts.ScriptKind.JSX
      case ts.Extension.Ts:
        return ts.ScriptKind.TS
      case ts.Extension.Tsx:
        return ts.ScriptKind.TSX
      case ts.Extension.Json:
        return ts.ScriptKind.JSON
      default:
        return ts.ScriptKind.Unknown
    }
  }

  function targetExtensionToScriptKind(ext: AllowedTargetExtensions) {
    switch (ext) {
      case ts.Extension.Ts:
        return ts.ScriptKind.TS
      case ts.Extension.Tsx:
        return ts.ScriptKind.TSX
    }
  }
}
