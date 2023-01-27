/**
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').Parent} Parent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').OutliningSpan} OutliningSpan
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 */

import {visit} from 'unist-util-visit'

import {unistPositionToTextSpan} from './utils.js'

/**
 * Create outline spans based on a markdown AST.
 *
 * @param {typeof import('typescript')} ts
 *   The TypeScript module to use.
 * @param {Root} ast
 *   The markdown AST to get outline spans for.
 * @returns {OutliningSpan[]}
 *   The outline spans that represent Markdown sections
 */
export function getFoldingRegions(ts, ast) {
  /** @type {OutliningSpan[]} */
  const sections = []

  visit(ast, (node) => {
    if (node.position && (node.type === 'code' || node.type === 'blockquote')) {
      sections.push({
        textSpan: unistPositionToTextSpan(node.position),
        hintSpan: unistPositionToTextSpan(node.position),
        bannerText: node.type,
        autoCollapse: false,
        kind: ts.OutliningSpanKind.Region
      })
    }

    if (!('children' in node)) {
      return
    }

    /** @type {(OutliningSpan | undefined)[]} */
    const scope = []

    for (const child of node.children) {
      const end = child.position?.end?.offset

      if (end === undefined) {
        continue
      }

      if (child.type === 'heading') {
        const index = child.depth - 1
        for (const done of scope.splice(index)) {
          if (done) {
            sections.push(done)
          }
        }

        scope[index] = {
          textSpan: unistPositionToTextSpan(
            /** @type {Position} */ (child.position)
          ),
          hintSpan: unistPositionToTextSpan(
            /** @type {Position} */ (child.position)
          ),
          bannerText: 'Heading ' + child.depth,
          autoCollapse: false,
          kind: ts.OutliningSpanKind.Region
        }
      }

      for (const section of scope) {
        if (section) {
          section.textSpan.length = end - section.textSpan.start
        }
      }
    }

    for (const section of scope) {
      if (section) {
        sections.push(section)
      }
    }
  })

  return sections
}
