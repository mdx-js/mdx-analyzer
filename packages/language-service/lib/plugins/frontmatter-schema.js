/**
 * @import {CodeMapping} from '@volar/language-service'
 * @import {Node as YamlNode} from 'yaml'
 */

import {isMap, isScalar, isSeq, parseDocument} from 'yaml'

/**
 * @typedef FrontmatterValidation
 *   Generated code that type checks parsed frontmatter, plus its source mapping.
 * @property {string} text
 *   The JavaScript to append to the embedded JavaScript file.
 * @property {CodeMapping} mapping
 *   A verification-only mapping whose `generatedOffsets` are relative to the
 *   start of `text`, and whose `sourceOffsets` are absolute offsets into the
 *   MDX file.
 */

/**
 * Build code that type checks parsed YAML frontmatter against a schema type,
 * arranged so TypeScript names the offending field:
 *
 * - An inferred value object assigned to a schema-typed const surfaces missing
 *   fields (`Property 'x' is missing`) and wrong-typed values (`Type … is not
 *   assignable`), mapped to the start of the frontmatter block.
 * - A separate keys-only literal, typed to reject unknown keys, surfaces excess
 *   keys, mapped to the exact key in the YAML.
 *
 * Only diagnostics are produced; the generated constructs aren’t used for
 * navigation or completion.
 *
 * @param {string} yaml
 *   The raw YAML frontmatter (without the `---` fences).
 * @param {number} valueOffset
 *   The absolute offset of `yaml` within the MDX file.
 * @param {string} type
 *   A JSDoc type expression the frontmatter must satisfy, for example
 *   `import('./frontmatter.js').Frontmatter`.
 * @returns {FrontmatterValidation | undefined}
 *   The generated code and mapping, or `undefined` when there’s nothing to
 *   check (empty or non-object YAML, or YAML that fails to parse).
 */
export function buildFrontmatterValidation(yaml, valueOffset, type) {
  const document = parseDocument(yaml)
  const {contents} = document

  // Only a cleanly parsed map is checkable. A half-typed block shouldn’t emit
  // false “missing field” diagnostics while the author is still typing.
  if (document.errors.length > 0 || !contents || !isMap(contents)) {
    return
  }

  /** @type {CodeMapping} */
  const mapping = {
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
      verification: true
    }
  }

  /**
   * Map a generated token onto a range of the MDX source.
   *
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
  function map(generatedOffset, generatedLength, sourceStart, sourceLength) {
    mapping.generatedOffsets.push(generatedOffset)
    mapping.generatedLengths?.push(generatedLength)
    mapping.sourceOffsets.push(valueOffset + sourceStart)
    mapping.lengths.push(Math.max(1, sourceLength))
  }

  let text = ''

  // 1. Hold the parsed values with their inferred types.
  text += 'const __mdxFrontmatterValue = (' + renderValue(contents) + ')\n'

  // 2. Structural check — names missing and wrong-typed fields. TypeScript
  //    reports on `__mdxFrontmatterChecked`, mapped to the block start.
  text += '/** @type {' + type + '} */\n'
  const checked = 'const __mdxFrontmatterChecked = __mdxFrontmatterValue'
  map(text.length, checked.length, 0, 3)
  text += checked + '\nvoid __mdxFrontmatterChecked\n'

  // 3. Excess-key check — a fresh literal of just the keys, rejecting unknowns.
  text += '/** @type {{ [K in keyof ' + type + ']?: unknown }} */\n'
  text += 'const __mdxFrontmatterKeys = ({'
  for (const item of contents.items) {
    const {key} = item
    if (!isScalar(key) || !key.range) {
      continue
    }

    const literal = JSON.stringify(String(key.value))
    map(text.length, literal.length, key.range[0], key.range[1] - key.range[0])
    text += literal + ': 0, '
  }

  text += '})\nvoid __mdxFrontmatterKeys\n'

  return {text, mapping}
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
