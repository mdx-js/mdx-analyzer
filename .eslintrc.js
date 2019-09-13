const { overrides } = require('@1stg/eslint-config/overrides')

module.exports = {
  extends: '@1stg',
  settings: {
    node: {
      allowModules: ['vscode']
    },
  },
  overrides: [
    ...overrides,
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/no-floating-promises': 0,
      },
    },
  ],
}
