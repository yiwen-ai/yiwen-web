/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
  },
  plugins: ['react-refresh'],
  rules: {
    '@typescript-eslint/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/newline-after-import': 'error',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external', 'internal'],
          'parent',
          ['sibling', 'index'],
        ],
        'newlines-between': 'never',
        alphabetize: { order: 'ignore' },
      },
    ],
    'no-console': 'error',
    'no-restricted-imports': [
      'error',
      {
        'paths': [
          {
            'name': 'react',
            'importNames': ['useLayoutEffect'],
            'message': "Please import from '@yiwen-ai/util' instead.",
          },
        ],
      },
    ],
    'no-useless-rename': 'error',
    'object-shorthand': ['error', 'always'],
    'react-refresh/only-export-components': [
      'error',
      { allowConstantExport: true },
    ],
    'react/jsx-boolean-value': ['error', 'always'],
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react/prop-types': 'off',
  },
  settings: {
    'import/internal-regex': '^#',
  },
}
