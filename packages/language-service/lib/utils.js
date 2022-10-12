/**
 * @typedef {import('estree').Program} Program
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast-util-mdx').MdxjsEsm} MdxjsEsm
 * @typedef {import('mdast-util-mdx').MdxFlowExpression} MdxFlowExpression
 * @typedef {import('mdast-util-mdx').MdxJsxAttribute} MdxJsxAttribute
 * @typedef {import('mdast-util-mdx').MdxTextExpression} MdxTextExpression
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('unified').Processor<Root>} Processor
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist').Position} Position
 */

/**
 * @typedef {[start: number, end: number]} OffsetRange
 */

import { visit } from 'unist-util-visit'

const componentStart = `
/**
 * Render the MDX contents.
 *
 * @param {MDXContentProps} props The props that have been passed to the MDX component.
 */
export default function MDXContent(props) {
  return <>
`
const componentEnd = `
  </>
}

// @ts-ignore
/** @typedef {Props} MDXContentProps */
`

const whitespaceRegex = /\s/u

/**
 * @param {OffsetRange[]} positions
 * @param {number} index
 * @returns {boolean} XXX
 */
function shouldShow(positions, index) {
  if (positions.length === 0) {
    return false
  }

  const [start, end] = positions[0]
  if (index < start) {
    return false
  }

  if (index < end) {
    return true
  }

  positions.shift()
  return shouldShow(positions, index)
}

/**
 * @param {OffsetRange} a
 * @param {OffsetRange} b
 * @returns {number} XXX
 */
function compareRanges(a, b) {
  return a[0] - b[0] || a[1] - b[1]
}

/**
 * @param {Parent} node
 * @returns {number | undefined} XXX
 */
function findFirstOffset(node) {
  for (const child of node.children) {
    const start = child.position?.start?.offset
    if (start != null) {
      return start
    }
  }
}

/**
 * @param {Parent} node
 * @returns {number | undefined} XXX
 */
function findLastOffset(node) {
  for (let index = node.children.length - 1; index >= 0; index--) {
    const end = node.children[index].position?.end?.offset
    if (end != null) {
      return end
    }
  }
}

/**
 * Convert MDX into JavaScript with JSX.
 *
 * MDX can be categorized in 3 types of content:
 *
 * 1. Markdown content; This is not relevant when offering TypeScript based intellisense.
 * 2. ESM content; This includes JavaScript imports and exports. When MDX is compiled, this content
 *    is moved to the top-level scope.
 * 3. JSX content; This includes JSX elements and expressions. When MDX is compiled, this content is
 *    moved into a function named `MDXContent`.
 *
 * The problem is that ESM and JSX can be mixed inside MDX, so the function body of `MDXContent` can
 * be mixed with content in the top-level scope. To turn MDX into JavaScript that the TypeScript
 * language service understands, we split the ESM and JSX content, by creating a copy of the
 * original document and replacing any character that doesn’t fall into that category with
 * whitespace.
 *
 * The JSX part is then wrapped inside an `MDXContent` function declaration and a JSX fragment. The
 * ESM and wrapped JSX parts are concatenated to produce valid JavaScript source code which
 * represents the JavaScript parts of MDX. This result can then be processed by the TypeScript
 * language service. Any positional information returned by TypeScript that represents an MDX file,
 * needs to be mapped using {@link toOriginalPosition}
 *
 * @see https://code.visualstudio.com/api/language-extensions/embedded-languages#language-services-sample
 * @param {string} mdx
 * @param {Processor} processor
 * @returns {string} JavaScript code that matches the MDX code, but shadowed.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function mdxToJsx(mdx, processor) {
  const ast = processor.parse(mdx)

  /** @type {OffsetRange[]} */
  const esmPositions = []
  /** @type {OffsetRange[]} */
  const jsxPositions = []

  visit(
    ast,
    /**
     * @param {Node} node
     */
    node => {
      const start = node.position?.start?.offset
      const end = node.position?.end?.offset

      if (start == null || end == null) {
        return
      }

      switch (node.type) {
        case 'mdxjsEsm':
          esmPositions.push([start, end])
          break
        case 'mdxJsxFlowElement': {
          const element = /** @type {Parent} */ (node)

          const firstOffset = findFirstOffset(element)
          const lastOffset = findLastOffset(element)
          if (firstOffset == null || lastOffset == null) {
            jsxPositions.push([start, end])
            break
          }

          jsxPositions.push([start, firstOffset], [lastOffset, end])
          break
        }
        case 'mdxFlowExpression':
        case 'mdxTextExpression':
          jsxPositions.push([start, end])
          if (/** @type {Program} */ (node.data?.estree)?.body.length === 0) {
            esmPositions.push([start + 1, end - 1])
          }
          break
      }
    },
  )

  esmPositions.sort(compareRanges)
  jsxPositions.sort(compareRanges)
  let esmShadow = ''
  let jsxShadow = ''

  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < mdx.length; index++) {
    const char = mdx[index]

    if (whitespaceRegex.test(char)) {
      esmShadow += char
      jsxShadow += char
      continue
    }

    esmShadow += shouldShow(esmPositions, index) ? char : ' '
    jsxShadow += shouldShow(jsxPositions, index) ? char : ' '
  }

  return esmShadow + componentStart + jsxShadow + componentEnd
}

/**
 * @param {IScriptSnapshot} snapshot A snapshot of the original source code.
 * @param {number} position The position of the incoming request.
 * @returns {number} The position mapped to the JSX part of the shadowed code.
 */
export function getJSXPosition(snapshot, position) {
  return position + componentStart.length + snapshot.getLength()
}

/**
 * @param {IScriptSnapshot} snapshot A snapshot of the original source code.
 * @param {number} position The position inside the shadowed code.
 * @returns {number} The position mapped back to the original source code.
 */
export function getOriginalPosition(snapshot, position) {
  const originalLength = snapshot.getLength()
  if (position < originalLength) {
    return position
  }
  return position - originalLength - componentStart.length
}

/**
 * Represent a unist position as a TypeScript text span.
 *
 * @param {Position} position The unist position to represent.
 * @returns {TextSpan} The input position as a text span.
 */
export function unistPositionToTextSpan(position) {
  return {
    start: /** @type {number} */ (position.start.offset),
    length:
      /** @type {number} */ (position.end.offset) -
      /** @type {number} */ (position.start.offset),
  }
}
