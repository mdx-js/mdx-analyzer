/**
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 * @typedef {import('vscode-languageserver-types').Hover} Hover
 * @typedef {import('vscode-languageserver-types').Position} Position
 */

/**
 * @param {LanguageService} ts
 * @param {TextDocument} doc
 * @param {Position} position
 * @returns {Hover | undefined} XXX
 */
export function provideHover(ts, doc, position) {
  const { pathname } = new URL(doc.uri)
  const quickInfo = ts.getQuickInfoAtPosition(pathname, doc.offsetAt(position))

  if (!quickInfo) {
    return
  }

  console.log(quickInfo)

  /** @type {string[]} */
  const sections = []

  if (quickInfo.documentation) {
    for (const documentation of quickInfo.documentation) {
      sections.push(documentation.text)
    }
  }

  if (quickInfo.tags) {
    for (const tag of quickInfo.tags) {
      const tagText = [`_@${tag.name.replaceAll('_', '\\_')}_`]
      if (tag.text) {
        tagText.push(' — ')
        for (const t of tag.text) {
          tagText.push(t.text)
        }
      }
      sections.push(tagText.join(''))
    }
  }

  return {
    contents: {
      kind: 'markdown',
      value: sections.join('\n\n'),
    },
  }
}
