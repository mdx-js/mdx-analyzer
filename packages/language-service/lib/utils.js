/**
 * @typedef {import('estree').Program} Program
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('typescript').TextSpan} TextSpan
 * @typedef {import('unified').Processor<Root>} Processor
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist').Position} Position
 *
 * @typedef {[start: number, end: number]} OffsetRange
 *
 * @typedef {object} MDXShadow
 * @property {(start?: number, end?: number) => string} getText
 *   Same as {@link IScriptSnapshot.getText}, except omitting start and end,
 *   returns the entire text.
 * @property {(position: number) => number | undefined} getShadowPosition
 *   Map a position from the real MDX document to the JSX shadow document.
 * @property {(shadowPosition: number) => number | undefined} getRealPosition
 *   Map a position from the shadow document to the real MDX document.
 * @property {unknown} [error]
 *   This is defined if a parsing error has occurred.
 * @property {Root} ast
 *   The markdown AST (mdast).
 *
 * @typedef {MDXShadow & IScriptSnapshot} MDXSnapshot
 */

import {visit} from 'unist-util-visit'

const componentStart = `
/**
 * Render the MDX contents.
 *
 * @param {MDXContentProps} props
 *   The props that have been passed to the MDX component.
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

const fallback = 'export {}\n'

const whitespaceRegex = /\s/u

/**
 * @param {OffsetRange[]} positions
 * @param {number} index
 * @returns {boolean} XXX
 */
function shouldShow(positions, index) {
  return positions.some(([start, end]) => start <= index && index < end)
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
    if (start !== undefined) {
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
    if (end !== undefined) {
      return end
    }
  }
}

/**
 * Convert MDX into JavaScript with JSX.
 *
 * MDX can be categorized in 3 types of content:
 *
 * 1. Markdown content; This is not relevant when offering TypeScript based IntelliSense.
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
 *   The MDX code.
 * @param {Processor} processor
 *   The unified processor to use.
 * @returns {MDXSnapshot} JavaScript code that matches the MDX code, but shadowed.
 */
export function mdxToJsx(mdx, processor) {
  /** @type {Root} */
  let ast
  try {
    ast = processor.parse(mdx)
  } catch (error) {
    return {
      dispose() {},
      ast: processor.parse(fallback),
      error,

      getChangeRange: () => undefined,
      getText: (start = 0, end = fallback.length) => fallback.slice(start, end),
      getLength: () => fallback.length,

      getShadowPosition: () => undefined,
      getRealPosition: () => undefined
    }
  }

  /** @type {OffsetRange[]} */
  const esmPositions = []
  /** @type {OffsetRange[]} */
  const jsxPositions = []

  visit(
    ast,
    /**
     * @param {Node} node
     */
    (node) => {
      const start = node.position?.start?.offset
      const end = node.position?.end?.offset

      if (start === undefined || end === undefined) {
        return
      }

      switch (node.type) {
        case 'mdxjsEsm': {
          esmPositions.push([start, end])
          break
        }

        case 'mdxJsxFlowElement': {
          const element = /** @type {Parent} */ (node)

          const firstOffset = findFirstOffset(element)
          const lastOffset = findLastOffset(element)
          if (firstOffset === undefined || lastOffset === undefined) {
            jsxPositions.push([start, end])
            break
          }

          jsxPositions.push([start, firstOffset], [lastOffset, end])
          break
        }

        case 'mdxFlowExpression':
        case 'mdxTextExpression': {
          jsxPositions.push([start, end])
          if (/** @type {Program} */ (node.data?.estree)?.body.length === 0) {
            esmPositions.push([start + 1, end - 1])
          }

          break
        }

        default: {
          break
        }
      }
    }
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

  const js = esmShadow + componentStart + jsxShadow + componentEnd

  return {
    ast,

    dispose() {},

    getChangeRange: () => undefined,
    getText: (start = 0, end = js.length) => js.slice(start, end),
    getLength: () => js.length,
    getShadowPosition(position) {
      if (shouldShow(esmPositions, position)) {
        return position
      }

      if (shouldShow(jsxPositions, position)) {
        return esmShadow.length + componentStart.length + position
      }
    },
    getRealPosition(shadowPosition) {
      if (shadowPosition <= esmShadow.length) {
        return shadowPosition
      }

      if (shadowPosition <= esmShadow.length + componentStart.length) {
        return
      }

      if (
        shadowPosition <=
        esmShadow.length + componentStart.length + jsxShadow.length
      ) {
        return shadowPosition - esmShadow.length - componentStart.length
      }
    }
  }
}

/**
 * Represent a unist position as a TypeScript text span.
 *
 * @param {Position} position
 *   The unist position to represent.
 * @returns {TextSpan}
 *   The input position as a text span.
 */
export function unistPositionToTextSpan(position) {
  return {
    start: /** @type {number} */ (position.start.offset),
    length:
      /** @type {number} */ (position.end.offset) -
      /** @type {number} */ (position.start.offset)
  }
}
