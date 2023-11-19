import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
	schema: './src/lib/schema.ts',
	out: './src/drizzle/migrations',
	driver: 'better-sqlite',
	dbCredentials: {
		url: 'sqlite://db.sqlite3',
	},
} satisfies Config
