import { URI } from 'vscode-uri'
import * as upath from 'upath'
import type { DocumentUri } from 'vscode-languageserver-textdocument'

export function uriToFsPath(uri: DocumentUri) {
  return upath.toUnix(URI.parse(uri).fsPath)
}

export function fsPathToUri(fsPath: string): DocumentUri {
  return URI.file(fsPath).toString()
}

export function normalizeFileName(fileName: string) {
  return uriToFsPath(fsPathToUri(fileName))
}

export function normalizePath(path: string): string {
  return URI.parse(path).fsPath.replace(/\\/g, '/')
}

export function uriIsFile(uri: URI) {
  return uri.scheme === 'file'
}
