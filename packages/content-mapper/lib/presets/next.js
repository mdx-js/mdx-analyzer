import {dirname, parse, relative} from 'node:path/posix'

/**
 * Remove a string prefix if the string starts with that prefix.
 *
 * @param {string} string
 *   The tring to remove the prefix from.
 * @param {string} prefix
 *   The prefix to remove.
 * @returns {string}
 *   The unprefixed string.
 */
function unprefix(string, prefix) {
  if (string.startsWith(prefix)) {
    return string.slice(prefix.length)
  }

  return string
}

/**
 * Get the props type of a Next.js route.
 *
 * @param {string} configFileName
 *   The file name of the TypeScript configuration file.
 * @param {string} fileName
 *   The file name to get the props for.
 * @returns {string | undefined}
 *   The virtual content to use as props.
 */
export function getNextPropsType(configFileName, fileName) {
  const relativePath = relative(dirname(configFileName), fileName)
  const unprefixed = unprefix(relativePath, 'src/')
  if (!unprefixed.startsWith('app/')) {
    return
  }
  const {dir, name} = parse(unprefix(unprefixed, 'app'))
  if (name !== 'page') {
    return
  }

  return `PageProps<'${dir}'>`
}
