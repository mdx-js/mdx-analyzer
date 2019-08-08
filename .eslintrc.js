const { all } = require('eslint-config-1stg/overrides')

module.exports = {
  extends: '1stg',
  overrides: [
    ...all,
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/no-floating-promises': 0,
      },
    },
  ],
}
