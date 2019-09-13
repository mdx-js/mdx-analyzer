import path from 'path'

import { runTests } from 'vscode-test'

function main() {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath = path.resolve(__dirname, '../../')

  // The path to the extension test script
  // Passed to --extensionTestsPath
  const extensionTestsPath = path.resolve(__dirname, './suite/index')

  // Download VS Code, unzip it and run the integration test
  return runTests({ extensionDevelopmentPath, extensionTestsPath })
}

main()
