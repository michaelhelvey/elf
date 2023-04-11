import alias from '@rollup/plugin-alias'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { join } from 'path'
import esbuild from 'rollup-plugin-esbuild'

const STATIC_PATH = join('app', 'static')
const JS_PATH = join('app', 'static', 'js')
const buildDir = fileType => join(STATIC_PATH, 'build', fileType)

const jsPlugins = [
	replace({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		preventAssignment: true,
	}),
	alias({
		entries: [
			{ find: 'react', replacement: 'preact/compat' },
			{ find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
			{ find: 'react-dom', replacement: 'preact/compat' },
			{ find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
		],
	}),
	nodeResolve(),
	esbuild({ minify: process.env.NODE_ENV === 'production', sourceMap: true }),
]

export default [
	{
		input: join(JS_PATH, 'global/index.ts'),
		output: {
			dir: join(buildDir('js'), 'global'),
			format: 'es',
			sourcemap: process.env.NODE_ENV !== 'production',
		},
		plugins: jsPlugins,
	},
	{
		input: {
			example_app: join(JS_PATH, 'example-app/index.tsx'),
		},
		output: {
			dir: join(buildDir('js'), 'apps'),
			format: 'es',
			sourcemap: process.env.NODE_ENV !== 'production',
		},
		plugins: jsPlugins,
	},
]
