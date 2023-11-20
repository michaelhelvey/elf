import { boolean, date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	first_name: text('first_name'),
	last_name: text('last_name'),
	email: text('email').unique().notNull(),
	avatar_url: text('avatar_url'),
	created_at: date('created_at').defaultNow().notNull(),
	updated_at: date('updated_at').defaultNow().notNull(),
})

export const lists = pgTable('lists', {
	id: serial('id').primaryKey(),
	owner_id: text('owner_id')
		.references(() => users.id)
		.notNull(),
	name: text('name').notNull(),
	created_at: date('created_at').defaultNow().notNull(),
	updated_at: date('updated_at').defaultNow().notNull(),
})

export const listItems = pgTable('list_items', {
	id: serial('id').primaryKey(),
	list_id: integer('list_id').references(() => lists.id),
	name: text('name').notNull(),
	purchased: boolean('purchased').default(false),
	created_at: date('created_at').defaultNow().notNull(),
	updated_at: date('updated_at').defaultNow().notNull(),
})

export const shares = pgTable('list_shares', {
	id: serial('id').primaryKey(),
	list_id: integer('list_id')
		.references(() => lists.id)
		.notNull(),
	shared_with_id: text('shared_with_id')
		.references(() => users.id)
		.notNull(),
	created_at: date('created_at').defaultNow().notNull(),
	updated_at: date('updated_at').defaultNow().notNull(),
})

export const shareTokens = pgTable('share_tokens', {
	token: text('token').primaryKey(),
	list_id: integer('list_id')
		.references(() => lists.id)
		.notNull(),
	expires_at: date('expires_at').notNull(),
	created_at: date('created_at').defaultNow().notNull(),
	updated_at: date('updated_at').defaultNow().notNull(),
})
