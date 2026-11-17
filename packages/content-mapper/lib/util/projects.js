/**
 * @import { Extension } from 'micromark-util-types'
 * @import { Processor } from 'unified'
 * @import { Path } from './misc.js'
 * @import { VirtualCodePluginFunction } from './plugin.js'
 * @import { OpenProjectParams, OptionDiagnostic } from '../protocol.js'
 */

import {pathToFileURL} from 'node:url'

import {resolve} from 'import-meta-resolve'
import defaultMdExtensions from 'markdown-extensions'
import {frontmatter} from 'micromark-extension-frontmatter'
import {gfmAutolinkLiteral} from 'micromark-extension-gfm-autolink-literal'
import {gfmFootnote} from 'micromark-extension-gfm-footnote'
import {gfmStrikethrough} from 'micromark-extension-gfm-strikethrough'
import {gfmTable} from 'micromark-extension-gfm-table'
import {gfmTaskListItem} from 'micromark-extension-gfm-task-list-item'
import {unified} from 'unified'

import * as messages from './messages.js'
import {isExtension} from './misc.js'
import {knownPlugins} from './plugin.js'

/**
 * @typedef Project
 * @property {boolean} checkCodeBlocks
 * @property {boolean} checkMdx
 * @property {string | undefined} configFileName
 * @property {string} jsxImportSource
 * @property {string[]} mdExtensions
 * @property {Extension[]} micromarkExtensions
 * @property {VirtualCodePluginFunction[]} plugins
 * @property {string | undefined} providerImportSource
 * @property {'@react-router/fs-routes' | 'next' | undefined} preset
 */

/**
 * @type {Map<string, Project>}
 */
export const projects = new Map()

/**
 * Check if an option value is a string.
 *
 * @param {Path} path
 *   The path to the option.
 * @param {unknown} value
 *   The value of the option.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @returns {string | undefined}
 *   The input string if or undefined.
 */
function checkString(path, value, diagnostics) {
  if (typeof value === 'string') {
    return value
  }

  if (value !== undefined) {
    diagnostics.push(messages.typeError(path, 'string'))
  }
}

/**
 * Check if an option value is a boolean.
 *
 * @param {Path} path
 *   The path to the option.
 * @param {unknown} value
 *   The value of the option.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @returns {boolean}
 *   The input boolean or false.
 */
function checkBoolean(path, value, diagnostics) {
  if (value === true || value === false) {
    return value
  }

  if (value !== undefined) {
    diagnostics.push(messages.typeError(path, 'boolean'))
  }

  return false
}

/**
 * Check if an option value is an array.
 *
 * @param {Path} path
 *   The path to the option.
 * @param {unknown} value
 *   The value of the option.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @param {unknown[]} defaultValue
 *   A default value to return if the value is not an array.
 * @returns {unknown[]}
 *   The input array if valid, the default value otherwise.
 */
function checkArray(path, value, diagnostics, defaultValue) {
  if (value === undefined) {
    return defaultValue
  }

  if (!Array.isArray(value)) {
    diagnostics.push(messages.typeError(path, 'Array'))
    return defaultValue
  }

  return value
}

/**
 * Check if an option is an allowed enum value.
 *
 * @template T
 *   A union of allowed values. Let TypeScript infer this from the allowed field.
 * @param {Path} path
 *   The path to the option.
 * @param {unknown} value
 *   The value of the option.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @param {T[]} allowed
 *   An array of allowed values.
 * @returns {T | undefined}
 *   The value if valid, undefined otherwise.
 */
function checkEnum(path, value, diagnostics, allowed) {
  if (value === undefined) {
    return
  }

  if (/** @type {unknown[]} */ (allowed).includes(value)) {
    return /** @type {T} */ (value)
  }

  diagnostics.push(messages.enumError(path, allowed))
}

/**
 * Check if an option is an array of file extensions.
 *
 * @param {unknown} value
 *   The value of the option.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @returns {string[]}
 *   A valid array of file extensions.
 */
function checkMdExtensions(value, diagnostics) {
  const array = checkArray(
    ['mdExtensions'],
    value,
    diagnostics,
    defaultMdExtensions.map((ext) => `.${ext}`)
  )

  return /** @type {string[]} */ (
    array.filter((item, index) => {
      const string = checkString(['mdExtensions', index], item, diagnostics)
      if (string === undefined) {
        return false
      }

      if (isExtension(string)) {
        return true
      }

      diagnostics.push(
        messages.expectExtension(['mdExtensions', index], string)
      )
      return false
    })
  )
}

/**
 * Check if an option is a plugin array.
 *
 * @param {Path} path
 *   The path to the option.
 * @param {unknown} value
 *   The value of the option.
 * @param {string} configFileName
 *   The full file path of the TypeScript configuration file.
 * @param {OptionDiagnostic[]} diagnostics
 *   An array to push a diagnostic to in case of a validation error.
 * @param {Processor} [processor]
 *   A unifier processor to register micromark extensions to.
 * @returns {Promise<VirtualCodePluginFunction[]>}
 *   An array of configured virtual code plugins.
 */
async function checkPluginArray(
  path,
  value,
  configFileName,
  diagnostics,
  processor
) {
  const array = checkArray(path, value, diagnostics, [])

  const plugins = await Promise.all(
    array.map(async (maybeTuple, index) => {
      const namePath = [...path, index]

      /** @type {string} */
      let name

      /** @type {unknown} */
      let options

      if (typeof maybeTuple === 'string') {
        name = maybeTuple
      } else if (Array.isArray(maybeTuple)) {
        ;[name, options] = maybeTuple
        namePath.push(0)
        if (!checkString(namePath, name, diagnostics)) {
          return
        }
      } else {
        diagnostics.push(messages.typeError(namePath, 'string or Array'))
        return
      }

      const knownPlugin = knownPlugins.get(name)
      if (knownPlugin) {
        return knownPlugin(options)
      }

      if (!processor) {
        diagnostics.push(messages.unknownPluginError(namePath, name))
        return
      }

      if (!configFileName) {
        return
      }

      try {
        const parent = String(pathToFileURL(configFileName))
        const url = resolve(name, parent)
        const {default: plugin} = await import(url)
        processor.use(plugin, options)
      } catch {
        diagnostics.push(messages.unresolvedPluginError(namePath, name))
      }
    })
  )

  return plugins.filter((plugin) => plugin != null)
}

/**
 * Normalize options if a project is opened.
 *
 * @param {Omit<OpenProjectParams, 'projectHandle'>} params
 *   The `openProject` params given by TypeScript.
 * @returns {Promise<[Project, OptionDiagnostic[]]>}
 *   A tuple of a normalized project and option diagnostics.
 */
export async function normalizeOptions({
  compilerOptions,
  configFileName,
  options = {}
}) {
  /** @type {OptionDiagnostic[]} */
  const diagnostics = []

  let {allowJs, jsxImportSource} = compilerOptions
  if (typeof jsxImportSource !== 'string') {
    jsxImportSource = 'react'
  }

  const checkMdx = checkBoolean(['checkMdx'], options.checkMdx, diagnostics)
  if (checkMdx && !allowJs) {
    diagnostics.push(messages.dependsCompilerOption(['checkMdx'], 'allowJs'))
  }

  const mdExtensions = checkMdExtensions(options.mdExtensions, diagnostics)

  /** @type {Extension[]} */
  let micromarkExtensions

  /** @type {VirtualCodePluginFunction[]} */
  let plugins
  if (
    configFileName ||
    options.remarkPlugins ||
    options.rehypePlugins ||
    options.recmaPlugins
  ) {
    const processor = unified()
    plugins = (
      await Promise.all([
        checkPluginArray(
          ['remarkPlugins'],
          options.remarkPlugins,
          configFileName,
          diagnostics,
          processor
        ),
        checkPluginArray(
          ['rehypePlugins'],
          options.rehypePlugins,
          configFileName,
          diagnostics
        ),
        checkPluginArray(
          ['recmaPlugins'],
          options.recmaPlugins,
          configFileName,
          diagnostics
        )
      ])
    ).flat()
    micromarkExtensions = processor.freeze().namespace.micromarkExtensions || []
  } else {
    plugins = []
    micromarkExtensions = [
      frontmatter(['toml', 'yaml']),
      gfmAutolinkLiteral(),
      gfmFootnote(),
      gfmStrikethrough(),
      gfmTable(),
      gfmTaskListItem()
    ]
  }

  /** @type {Project} */
  const project = {
    checkCodeBlocks: checkBoolean(
      ['checkCodeBlocks'],
      options.checkCodeBlocks,
      diagnostics
    ),
    checkMdx,
    configFileName: configFileName || undefined,
    jsxImportSource,
    mdExtensions,
    micromarkExtensions,
    plugins,
    preset: checkEnum(['preset'], options.preset, diagnostics, [
      '@react-router/fs-routes',
      'next'
    ]),
    providerImportSource: checkString(
      ['providerImportSource'],
      options.providerImportSource,
      diagnostics
    )
  }

  return [project, diagnostics]
}
