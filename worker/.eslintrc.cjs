const path = require('path');

module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    worker: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
  ],
  ignorePatterns: ['worker/**/*.js', 'dist/**/*.js'],
  globals: {
    VH7: 'writable',
  },
  rules: {
    'no-underscore-dangle': 'off',
  }
};
