import sharedConfig from '@wtflegal/dev-configs/eslints/typescript.mjs'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  {
    ignores: ['build/**', 'docs/**'],
  },
  // dev-configs currently does not have types yet
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    files: ['src/**/*.mts'],
    plugins: {
      jsdoc,
    },
    rules: {
      // Require JSDoc comments
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          // Allow TypeDoc-specific tags
          definedTags: [
            'category',
            'categoryDescription',
            'group',
            'groupDescription',
            'module',
            'moduleDescription',
            'hidden',
            'document',
          ],
        },
      ],
    },
  },
]
