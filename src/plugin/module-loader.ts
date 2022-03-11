import type * as ts from 'typescript/lib/tsserverlibrary'

import { Logger } from './logger'
import { MdxSnapshotManager } from './mdx-snapshots'
import { createMdxSys } from './mdx-sys'
import { ensureRealMdxFilePath, isVirtualMdxFilePath } from './utils'

/**
 * Caches resolved modules.
 */
class ModuleResolutionCache {
  private readonly cache = new Map<string, ts.ResolvedModule>()

  /**
   * Tries to get a cached module.
   */
  get(
    moduleName: string,
    containingFile: string,
  ): ts.ResolvedModule | undefined {
    return this.cache.get(this.getKey(moduleName, containingFile))
  }

  /**
   * Caches resolved module, if it is not undefined.
   */
  set(
    moduleName: string,
    containingFile: string,
    resolvedModule: ts.ResolvedModule | undefined,
  ) {
    if (!resolvedModule) {
      return
    }
    this.cache.set(this.getKey(moduleName, containingFile), resolvedModule)
  }

  /**
   * Deletes module from cache. Call this if a file was deleted.
   * @param resolvedModuleName full path of the module
   */
  delete(resolvedModuleName: string): void {
    for (const [key, val] of this.cache.entries()) {
      if (val.resolvedFileName === resolvedModuleName) {
        this.cache.delete(key)
      }
    }
  }

  private getKey(moduleName: string, containingFile: string) {
    return containingFile + ':::' + ensureRealMdxFilePath(moduleName)
  }
}

/**
 * Creates a module loader than can also resolve `.svelte` files.
 *
 * The typescript language service tries to look up other files that are referenced in the currently open svelte file.
 * For `.ts`/`.js` files this works, for `.svelte` files it does not by default.
 * Reason: The typescript language service does not know about the `.svelte` file ending,
 * so it assumes it's a normal typescript file and searches for files like `../Component.svelte.ts`, which is wrong.
 * In order to fix this, we need to wrap typescript's module resolution and reroute all `.svelte.ts` file lookups to .svelte.
 */
export function patchModuleLoader(
  logger: Logger,
  snapshotManager: MdxSnapshotManager,
  typescript: typeof ts,
  lsHost: ts.LanguageServiceHost,
  project: ts.server.Project,
): void {
  const mdxSys = createMdxSys(typescript, logger)
  const moduleCache = new ModuleResolutionCache()
  const origResolveModuleNames = lsHost.resolveModuleNames?.bind(lsHost)

  lsHost.resolveModuleNames = resolveModuleNames

  const origRemoveFile = project.removeFile.bind(project)
  project.removeFile = (info, fileExists, detachFromProject) => {
    logger.log('File is being removed. Delete from cache: ', info.fileName)
    moduleCache.delete(info.fileName)
    return origRemoveFile(info, fileExists, detachFromProject)
  }

  function resolveModuleNames(
    moduleNames: string[],
    containingFile: string,
    reusedNames: string[] | undefined,
    redirectedReference: ts.ResolvedProjectReference | undefined,
    compilerOptions: ts.CompilerOptions,
  ): Array<ts.ResolvedModule | undefined> {
    logger.log('Resolving modules names for ' + containingFile)
    // Try resolving all module names with the original method first.
    // The ones that are undefined will be re-checked if they are a
    // Svelte file and if so, are resolved, too. This way we can defer
    // all module resolving logic except for Svelte files to TypeScript.
    const resolved = origResolveModuleNames?.(
      moduleNames,
      containingFile,
      reusedNames,
      redirectedReference,
      compilerOptions,
    ) || [...new Array(moduleNames.length)]

    return resolved.map((moduleName, idx) => {
      const fileName = moduleNames[idx]
      if (moduleName || !ensureRealMdxFilePath(fileName).endsWith('.mdx')) {
        return moduleName
      }

      const cachedModule = moduleCache.get(fileName, containingFile)
      if (cachedModule) {
        return cachedModule
      }

      const resolvedModule = resolveModuleName(
        fileName,
        containingFile,
        compilerOptions,
      )
      moduleCache.set(fileName, containingFile, resolvedModule)
      return resolvedModule
    })
  }

  function resolveModuleName(
    name: string,
    containingFile: string,
    compilerOptions: ts.CompilerOptions,
  ): ts.ResolvedModule | undefined {
    const svelteResolvedModule = typescript.resolveModuleName(
      name,
      containingFile,
      compilerOptions,
      mdxSys,
    ).resolvedModule
    if (
      !svelteResolvedModule ||
      !isVirtualMdxFilePath(svelteResolvedModule.resolvedFileName)
    ) {
      return svelteResolvedModule
    }

    const resolvedFileName = ensureRealMdxFilePath(
      svelteResolvedModule.resolvedFileName,
    )
    logger.log('Resolved', name, 'to Mdx file', resolvedFileName)
    const snapshot = snapshotManager.create(resolvedFileName)
    if (!snapshot) {
      return undefined
    }

    return {
      extension: typescript.Extension.Tsx,
      resolvedFileName,
    }
  }
}
