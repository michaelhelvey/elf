import { date, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	first_name: text('first_name'),
	last_name: text('last_name'),
	created_at: date('created_at').defaultNow(),
	updated_at: date('updated_at').defaultNow(),
})
