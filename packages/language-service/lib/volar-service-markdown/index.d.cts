/**
 * <undefined>
 */
export type Service = import('@volar/language-service').Service
export type TextDocument = import('@volar/language-service').TextDocument
export type ILogger = import('vscode-markdown-languageservice').ILogger
export type IMdParser = import('vscode-markdown-languageservice').IMdParser
export type IWorkspace = import('vscode-markdown-languageservice').IWorkspace
/**
 * @returns {Service}
 */
export function createMarkdownService(): Service
