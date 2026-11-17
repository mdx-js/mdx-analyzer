import {dirname, parse, relative} from 'node:path/posix'

/**
 * @typedef ReactRouterPropsTypeResult
 *   The result of {@link getReactRouterPropsType}.
 * @property {string} import
 *   An import statement to insert into the virtual content.
 * @property {string} type
 *   The virtual content to use as props.
 */

/**
 * Get the props type of a React Router route.
 *
 * @param {string} configFileName
 *   The file name of the TypeScript configuration file.
 * @param {string} fileName
 *   The file name to get the props for.
 * @returns {ReactRouterPropsTypeResult | undefined}
 *   The props to use.
 */
export function getReactRouterPropsType(configFileName, fileName) {
  const relativePath = relative(dirname(configFileName), fileName)
  const routesDir = 'app/routes/'

  if (!relativePath.startsWith(routesDir)) {
    return
  }

  const path = relativePath.slice(routesDir.length)
  const {dir, name} = parse(path)

  if (dir.includes('/')) {
    return
  }

  return {
    import: `\n/** @import { Route } from './+types/${name}.js' */\n`,
    type: 'Route.ComponentProps'
  }
}
