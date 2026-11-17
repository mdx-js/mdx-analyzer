/**
 * @import { CloseProjectParams } from '../protocol.js'
 */

import {projects} from '../util/projects.js'

/**
 * Close a TypeScript project.
 *
 * @param {CloseProjectParams} params
 *   The `opemProject` params given by TypeScript.
 * @returns {undefined}
 */
export function closeProject(params) {
  projects.delete(params.projectHandle)
}
