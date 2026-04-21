// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import boundaries from 'eslint-plugin-boundaries';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      boundaries: fixupPluginRules(boundaries),
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'domain',
          pattern: 'src/domain/**',
          mode: 'full',
        },
        {
          type: 'application',
          pattern: 'src/application/**',
          mode: 'full',
        },
        {
          type: 'infrastructure',
          pattern: 'src/infrastructure/**',
          mode: 'full',
        },
        {
          type: 'main',
          pattern: 'src/main.ts',
          mode: 'full',
        },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'domain',
              allow: ['domain'],
            },
            {
              from: 'application',
              allow: ['domain', 'application'],
            },
            {
              from: 'infrastructure',
              allow: ['domain', 'application', 'infrastructure'],
            },
            {
              from: 'main',
              allow: ['infrastructure'],
            },
          ],
        },
      ],
    },
  },
);
