/**
 * @import { OpenProjectParams, OpenProjectResult } from '../protocol.js'
 */

import {normalizeOptions, projects} from '../util/projects.js'

/**
 * Open a TypeScript project.
 *
 * @param {OpenProjectParams} params
 *   The `opemProject` params given by TypeScript.
 * @returns {Promise<OpenProjectResult>}
 *   The result for the `openProject` request.
 */
export async function openProject(params) {
  const [project, optionDiagnostics] = await normalizeOptions(params)
  projects.set(params.projectHandle, project)

  return {optionDiagnostics}
}
