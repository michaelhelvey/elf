import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import path from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const client = postgres(process.env.DATABASE_URL, { max: 1 })

await migrate(drizzle(client), { migrationsFolder: path.join(__dirname, 'migrations') })

process.exit(0)
