import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores([
        '**/node_modules/',
        '**/build/',
        '**/coverage/',
        '**/dist/',
        '**/.next/',
        '**/.now/',
        '**/.vitest/',
        '**/*.json',
        '**/*.lock',
        '**/*.env',
        '**/*.log',
        '**/*.d.ts',
        '**/babel.config.cjs',
        '**/jest.config.ts',
        '**/eslint.config.*'
    ]),
    {
        extends: compat.extends(
            'plugin:jsx-a11y/recommended',
            'plugin:prettier/recommended',
            'plugin:react/recommended'
        ),

        files: ['src/**/*.*'],

        plugins: {
            '@typescript-eslint': typescriptEslint,
            'jsx-a11y': jsxA11Y,
            prettier,
            react,
            'simple-import-sort': simpleImportSort,
            'unused-imports': unusedImports
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },

                project: ['./tsconfig.json', './tsconfig.test.json']
            }
        },

        settings: {
            react: {
                version: 'detect'
            }
        },

        rules: {
            '@next/next/no-html-link-for-pages': 'off',

            '@typescript-eslint/consistent-type-exports': [
                'error',
                {
                    fixMixedExportsWithInlineTypeSpecifier: false
                }
            ],

            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    fixStyle: 'separate-type-imports',
                    prefer: 'type-imports'
                }
            ],

            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'warn',

            'brace-style': [
                'error',
                '1tbs',
                {
                    allowSingleLine: true
                }
            ],

            'consistent-return': 'error',
            'import/first': 'off',
            'import/order': 'off',
            indent: 'off',
            'jsx-a11y/alt-text': 'off',
            'jsx-a11y/anchor-is-valid': 'off',
            'jsx-a11y/interactive-supports-focus': 'off',

            'no-console': [
                'error',
                {
                    allow: ['debug', 'warn', 'error']
                }
            ],

            'no-mixed-operators': 'off',
            'no-unused-vars': 'off',
            'no-useless-constructor': 'off',
            'prettier/prettier': 'error',
            'react/jsx-uses-react': 'off',
            'react/no-children-prop': 'off',
            'react/no-find-dom-node': 'off',
            'react/no-string-refs': 'off',
            'react/prop-types': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/display-name': 'off',
            semi: ['error', 'always'],
            'sort-imports': 'off',
            'simple-import-sort/exports': 'error',

            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['server-only'],
                        ['^\\u0000', 'vitest', 'jest'],
                        ['^node:', '^react'],
                        ['^@/\\w', '^'],
                        ['^@/components(/.*|$)'],
                        ['^\\.\\.(?!/?$)'],
                        ['^\\.', '^\\./?$'],
                        ['^.+\\u0000$', '^.+\\u0000$\\.']
                    ]
                }
            ],

            'standard/computed-property-even-spacing': 'off',
            'unused-imports/no-unused-imports': 'error',

            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_'
                }
            ]
        }
    }
]);
