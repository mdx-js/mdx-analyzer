const { overrides } = require('@1stg/eslint-config/overrides')

module.exports = {
  extends: '@1stg',
  overrides: [
    ...overrides,
    {
      files: '*.mdx',
      settings: {
        'import/resolver': {
          typescript: true,
        },
      },
    },
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/no-floating-promises': 0,
      },
    },
  ],
}
