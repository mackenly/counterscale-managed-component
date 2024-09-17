const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tseslintParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const stylisticTs = require('@stylistic/eslint-plugin-ts');

module.exports = [
	eslint.configs.recommended,
	{
		files: ['**/*.{js,ts,tsx}'],
		languageOptions: {
			parser: tseslintParser,
			parserOptions: {
				ecmaVersion: 'latest',
			},
			globals: {
				// Browser globals
				fetch: 'readonly',
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				URL: 'readonly',
				crypto: 'readonly',
				// Node.js globals
				process: 'readonly',
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				// Custom globals
				webcm: 'writable',
				URLSearchParams: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			prettier: prettierPlugin,
			'@stylistic/ts': stylisticTs,
		},
		rules: {
			'prettier/prettier': ['error', { semi: true }],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ ignoreRestSiblings: true, argsIgnorePattern: '^_' },
			],
			'@stylistic/ts/semi': ['warn', 'always'],
			// Relaxing some rules
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-console': 'off',
		},
		settings: {
			// Add any necessary settings here
		},
	},
	{
		files: ['**/*.d.ts'],
		rules: {
			'no-undef': 'off',
		},
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			globals: {
				webcm: 'writable',
			},
		},
	},
	{
		ignores: [
			// Add any files or directories you want to ignore
			'dist/',
		],
	},
];
