/// <reference types="vitest" />
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tsconfigPaths(), preact()],
	test: {
		globals: true,
		include: ['**/app/static/js/**{test,spec}.{ts,tsx}'],
		environment: 'happy-dom',
		setupFiles: './app/static/js/setup-tests.ts',
		coverage: {
			provider: 'istanbul',
		},
	},
})
