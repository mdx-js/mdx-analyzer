// import ts from 'typescript';
import { Logger } from './logger'
import {
  ensureRealMdxFilePath,
  isVirtualMdxFilePath,
  toRealMdxFilePath,
} from './utils'

/**
 * This should only be accessed by TS mdx module resolution.
 */
export function createMdxSys(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  logger: Logger,
) {
  const mdxSys: ts.System = {
    ...ts.sys,
    fileExists(path: string) {
      return ts.sys.fileExists(ensureRealMdxFilePath(path))
    },
    readDirectory(path, extensions, exclude, include, depth) {
      const extensionsWithMdx = [...(extensions ?? []), '.mdx']

      return ts.sys.readDirectory(
        path,
        extensionsWithMdx,
        exclude,
        include,
        depth,
      )
    },
  }

  if (ts.sys.realpath) {
    const realpath = ts.sys.realpath
    mdxSys.realpath = function (path) {
      if (isVirtualMdxFilePath(path)) {
        return realpath(toRealMdxFilePath(path)) + '.tsx'
      }
      return realpath(path)
    }
  }

  return mdxSys
}
