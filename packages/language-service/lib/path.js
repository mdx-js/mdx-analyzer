/**
 * Remove the `.jsx` postfix from a file name ending with `.mdx.jsx`.
 *
 * @param {string} fileName
 *   The file name to process.
 * @returns {string}
 *   The filename without the `.jsx` postfix if it ends with `.mdx.jsx`.
 */
export function fakeMdxPath(fileName) {
  const postfix = '.jsx'

  if (fileName.endsWith(`.mdx${postfix}`)) {
    return fileName.slice(0, -postfix.length)
  }

  return fileName
}
