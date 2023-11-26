import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
	schema: './src/lib/schema.server.ts',
	out: './src/drizzle/migrations',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL,
	},
} satisfies Config
