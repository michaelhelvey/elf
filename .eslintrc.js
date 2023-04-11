const looseTsConfiguration = {
	'@typescript-eslint/no-unsafe-member-access': 'off',
	'@typescript-eslint/no-unsafe-argument': 'off',
	'@typescript-eslint/no-unsafe-assignment': 'off',
	'@typescript-eslint/no-var-requires': 'off',
	'@typescript-eslint/no-explicit-any': 'off',
	'@typescript-eslint/unbound-method': 'off',
	'@typescript-eslint/require-await': 'off',
	'@typescript-eslint/consistent-type-imports': [
		'error',
		{ prefer: 'type-imports', disallowTypeAnnotations: false },
	],
}

/** @type {import('@types/eslint').Linter.BaseConfig}*/
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
	plugins: ['@typescript-eslint', 'jest', 'react', 'jsx-a11y', 'testing-library', 'jest-dom'],
	extends: [
		'eslint:recommended',
		'prettier',
		'plugin:jest/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:testing-library/react',
		'plugin:jest-dom/recommended',
	],
	rules: {
		'no-console': ['warn'],
		'@typescript-eslint/no-explicit-any': 'off',
	},
	// While we use vitest instead of jest, because of the very similar API, we
	// can still make good use of jest's linting plugin
	settings: {
		jest: {
			version: 28,
		},
		react: {
			version: 'detect',
		},
	},
	overrides: [
		{
			files: ['*.test.*'],
			rules: {
				...looseTsConfiguration,
			},
		},
	],
	ignorePatterns: ['node_modules', 'coverage', 'build', '*.js', '*.mjs'],
}
