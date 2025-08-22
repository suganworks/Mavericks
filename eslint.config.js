import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Node context (build & scripts)
    files: ['scripts/**/*.js', 'vite.config.*', 'vitest.config.*', '*.config.*', 'eslint.config.js', 'tailwind.config.*', 'postcss.config.*'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node },
      sourceType: 'module',
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    // Allow experimentation in scripts without strict unused var failures
    files: ['scripts/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    // Relax unused var errors in pages (warn only) while iterating rapidly
    files: ['src/pages/**/*.{js,jsx}', 'src/components/**/*.{js,jsx}', 'src/hooks/**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
