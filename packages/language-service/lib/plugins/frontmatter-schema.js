/**
 * @import {CodeMapping} from '@volar/language-service'
 * @import {Node as YamlNode} from 'yaml'
 */

import {isMap, isScalar, isSeq, parseDocument} from 'yaml'

/**
 * @typedef FrontmatterValidation
 *   Generated code that checks parsed frontmatter, plus its source mappings.
 * @property {string} text
 *   The JavaScript to append to the embedded JavaScript file.
 * @property {CodeMapping[]} mappings
 *   Mappings whose `generatedOffsets` are relative to the start of `text`, and
 *   whose `sourceOffsets` are absolute offsets into the MDX file. There are up
 *   to two: a verification-only mapping (diagnostics) and a
 *   navigation/completion mapping (hover, go to definition, and completion on
 *   individual keys).
 */

/**
 * @typedef KeyHint
 *   The leading identifier of a frontmatter key and where it starts.
 * @property {string} name
 *   The identifier.
 * @property {number} start
 *   Its offset within the YAML block.
 */

/**
 * @typedef Blank
 *   A blank or whitespace-only line, a candidate spot for a new key.
 * @property {number} start
 *   Its offset within the YAML block.
 * @property {number} length
 *   Its length.
 */

/**
 * Build code that type checks parsed YAML frontmatter against a schema type and
 * exposes each key to editor features.
 *
 * - An inferred value object assigned to a schema-typed const surfaces missing
 *   fields (`Property 'x' is missing`) and wrong-typed values (`Type … is not
 *   assignable`), mapped to the start of the frontmatter block.
 * - A separate keys-only literal, typed to reject unknown keys, surfaces excess
 *   keys, mapped to the exact key in the YAML.
 * - Property accesses on a schema-typed binding give each key hover, go to
 *   definition, and completion — including on blank lines, where completion
 *   offers every schema field.
 *
 * The diagnostics require a cleanly-parsed map, so a half-typed block doesn’t
 * emit false “missing field” errors. The per-key features are recovered even
 * from a partially-parsed block, so completion works while a key is being typed.
 *
 * @param {string} yaml
 *   The raw YAML frontmatter (without the `---` fences).
 * @param {number} valueOffset
 *   The absolute offset of `yaml` within the MDX file.
 * @param {string} type
 *   A JSDoc type expression the frontmatter must satisfy, for example
 *   `import('./frontmatter.js').Frontmatter`.
 * @returns {FrontmatterValidation | undefined}
 *   The generated code and mappings, or `undefined` when there’s nothing to do.
 */
export function buildFrontmatterValidation(yaml, valueOffset, type) {
  const document = parseDocument(yaml)
  const {contents} = document

  const cleanMap =
    document.errors.length === 0 && contents && isMap(contents)
      ? contents
      : undefined
  const hints = collectKeyHints(yaml, contents)
  const blanks = blankLines(yaml)

  if (!cleanMap && hints.length === 0 && blanks.length === 0) {
    return
  }

  // Two mappings with distinct roles, so each YAML key drives the right feature
  // from the right generated construct.
  const diagnostics = newMapping({verification: true})
  const navigation = newMapping({
    completion: true,
    navigation: true,
    semantic: true
  })

  /**
   * Map a generated token onto a range of the MDX source.
   *
   * @param {CodeMapping} mapping
   *   The mapping to append to.
   * @param {number} generatedOffset
   *   The offset of the token within `text`.
   * @param {number} generatedLength
   *   The length of the generated token.
   * @param {number} sourceStart
   *   The start of the source range, relative to the YAML block.
   * @param {number} sourceLength
   *   The length of the source range.
   * @returns {undefined}
   */
  function map(
    mapping,
    generatedOffset,
    generatedLength,
    sourceStart,
    sourceLength
  ) {
    mapping.generatedOffsets.push(generatedOffset)
    mapping.generatedLengths?.push(generatedLength)
    mapping.sourceOffsets.push(valueOffset + sourceStart)
    mapping.lengths.push(Math.max(1, sourceLength))
  }

  let text = ''

  if (cleanMap) {
    // 1. Hold the parsed values with their inferred types.
    text += 'const __mdxFrontmatterValue = (' + renderValue(cleanMap) + ')\n'

    // 2. Structural check — names missing and wrong-typed fields. TypeScript
    //    reports on `__mdxFrontmatterChecked`, mapped to the block start.
    text += '/** @type {' + type + '} */\n'
    const checked = 'const __mdxFrontmatterChecked = __mdxFrontmatterValue'
    map(diagnostics, text.length, checked.length, 0, 3)
    text += checked + '\nvoid __mdxFrontmatterChecked\n'

    // 3. Excess-key check — a fresh literal of just the keys, rejecting unknowns.
    text += '/** @type {{ [K in keyof ' + type + ']?: unknown }} */\n'
    text += 'const __mdxFrontmatterKeys = ({'
    for (const item of cleanMap.items) {
      const {key} = item
      if (!isScalar(key) || !key.range) {
        continue
      }

      const literal = JSON.stringify(String(key.value))
      map(
        diagnostics,
        text.length,
        literal.length,
        key.range[0],
        key.range[1] - key.range[0]
      )
      text += literal + ': 0, '
    }

    text += '})\nvoid __mdxFrontmatterKeys\n'
  }

  // 4. Per-key hover, go to definition, and completion — property access on a
  //    schema-typed binding, so each YAML key resolves to its schema field. Not
  //    verified (diagnostics come from steps 2–3), so unknown or half-typed keys
  //    here are harmless.
  text += '/** @type {' + type + '} */\n'
  text += 'const __mdxFrontmatterFields = /** @type {any} */ (undefined)\n'
  for (const hint of hints) {
    text += 'void __mdxFrontmatterFields.'
    map(navigation, text.length, hint.name.length, hint.start, hint.name.length)
    text += hint.name + '\n'
  }

  // Blank or whitespace-only lines are candidate spots for a new key. Map them
  // to a bare member access with a zero-length generated anchor right after the
  // dot, so the cursor lands with an empty prefix and completion offers every
  // schema field even though no key has been typed yet.
  for (const blank of blanks) {
    text += 'void __mdxFrontmatterFields.'
    map(navigation, text.length, 0, blank.start, blank.length)
    text += '$_\n'
  }

  const mappings = [diagnostics, navigation].filter(
    (mapping) => mapping.generatedOffsets.length > 0
  )
  return {text, mappings}
}

/**
 * Create an empty mapping with the given roles enabled and the rest disabled.
 *
 * @param {Partial<CodeMapping['data']>} data
 *   The roles to enable.
 * @returns {CodeMapping}
 *   The mapping.
 */
function newMapping(data) {
  return {
    sourceOffsets: [],
    generatedOffsets: [],
    lengths: [],
    generatedLengths: [],
    data: {
      completion: false,
      format: false,
      navigation: false,
      semantic: false,
      structure: false,
      verification: false,
      ...data
    }
  }
}

/**
 * Recover the leading identifier of each frontmatter key, tolerant of a
 * half-typed block. Works from a partially-parsed map (keys the YAML parser
 * recovered despite errors) or a lone scalar (the very first key being typed).
 *
 * @param {string} yaml
 *   The raw YAML frontmatter.
 * @param {YamlNode | null} contents
 *   The parsed document contents.
 * @returns {KeyHint[]}
 *   The recovered key hints.
 */
function collectKeyHints(yaml, contents) {
  /** @type {KeyHint[]} */
  const hints = []

  /**
   * @param {readonly [number, number, number] | undefined} range
   * @returns {undefined}
   */
  function push(range) {
    if (!range) {
      return
    }

    const [start, end] = range
    const raw = yaml.slice(start, end)
    const lead = raw.length - raw.trimStart().length
    const match = /^[A-Za-z_$][\w$]*/.exec(raw.slice(lead))
    if (match) {
      hints.push({name: match[0], start: start + lead})
    }
  }

  if (isMap(contents)) {
    for (const item of contents.items) {
      if (isScalar(item.key)) {
        push(item.key.range ?? undefined)
      }
    }
  } else if (isScalar(contents)) {
    push(contents.range ?? undefined)
  }

  return hints
}

/**
 * Find the blank or whitespace-only lines in a YAML block.
 *
 * @param {string} yaml
 *   The raw YAML frontmatter.
 * @returns {Blank[]}
 *   The blank lines, with block-relative offsets.
 */
function blankLines(yaml) {
  /** @type {Blank[]} */
  const blanks = []
  let at = 0
  for (const line of yaml.split('\n')) {
    if (line.trim() === '') {
      blanks.push({start: at, length: Math.max(1, line.length)})
    }

    at += line.length + 1
  }

  return blanks
}

/**
 * Render a YAML node as a plain JavaScript literal, faithful to its type.
 *
 * @param {YamlNode} node
 *   The YAML node to render.
 * @returns {string}
 *   The JavaScript literal.
 */
function renderValue(node) {
  if (isMap(node)) {
    const entries = []
    for (const item of node.items) {
      if (!isScalar(item.key)) {
        continue
      }

      const key = JSON.stringify(String(item.key.value))
      const value = item.value
        ? renderValue(/** @type {YamlNode} */ (item.value))
        : 'undefined'
      entries.push(key + ': ' + value)
    }

    return '{' + entries.join(', ') + '}'
  }

  if (isSeq(node)) {
    return (
      '[' +
      node.items
        .map((item) => renderValue(/** @type {YamlNode} */ (item)))
        .join(', ') +
      ']'
    )
  }

  if (isScalar(node)) {
    return scalarLiteral(node.value, node.source)
  }

  return 'undefined'
}

/**
 * Emit a scalar as a JavaScript literal, faithful to the YAML-parsed type.
 *
 * @param {unknown} value
 *   The parsed scalar value.
 * @param {string | undefined} source
 *   The original source text of the scalar.
 * @returns {string}
 *   The JavaScript literal.
 */
function scalarLiteral(value, source) {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? String(value)
      : JSON.stringify(String(value))
  }

  if (typeof value === 'boolean') {
    return String(value)
  }

  if (value === null || value === undefined) {
    return 'null'
  }

  // Anything exotic (for example a timestamp under YAML 1.1) falls back to its
  // source text as a string, which matches how most frontmatter loaders behave.
  return JSON.stringify(source ?? String(value))
}
