module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  settings: { react: { version: 'detect', runtime: 'automatic' } },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['react', 'sonarjs'],
  rules: {
    // 'prefer-destructuring': ['error', { object: true, array: false }],
    'import/prefer-default-export': 0,
    // '@typescript-eslint/explicit-function-return-type': 0,
    // '@typescript-eslint/no-use-before-define': 0,
    // '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-explicit-any': 0,
    // 'no-cond-assign': 0,
    // 'react/prop-types': 0,
    'no-dupe-class-members': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-non-null-asserted-optional-chain': 0, // Look i know what i'm doing, honest
    // 'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        // I fixed it
        'ts-ignore': 'allow-with-description',
        'ts-expect-error': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': 'allow-with-description',
      },
    ],
    '@typescript-eslint/no-namespace': 0, // This is how scryfall does it and I don't want to rewrite their work more than I need to
    eqeqeq: 0,
    // 'no-restricted-globals': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'react-hooks/exhaustive-deps': 0,
    'no-empty': 0,
    'sonarjs/no-in-misuse': 'error',

    'react/no-unescaped-entities': [
      'error',
      {
        forbid: [
          {
            char: '>',
            alternatives: ['&gt;'],
          },
          {
            char: '}',
            alternatives: ['&#125;'],
          },
        ],
      },
    ],

    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Fix #2 - Add this override
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['packages/frontend/**/*.ts', 'packages/frontend/**/*.tsx'],
      parserOptions: {
        project: './packages/frontend/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    // Backend workspace
    {
      files: ['packages/backend/**/*.ts', 'packages/backend/**/*.tsx'],
      parserOptions: {
        project: './packages/backend/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    // Shared workspace
    {
      files: ['packages/shared/**/*.ts', 'packages/shared/**/*.tsx'],
      parserOptions: {
        project: './packages/shared/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    // Server workspace
    {
      files: ['packages/server/**/*.ts', 'packages/server/**/*.tsx'],
      parserOptions: {
        project: './packages/server/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    // Scripts workspace
    {
      files: ['packages/scripts/**/*.ts', 'packages/scripts/**/*.tsx'],
      parserOptions: {
        project: './packages/scripts/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
