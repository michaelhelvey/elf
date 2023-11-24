import { desc, eq } from 'drizzle-orm'
import { db } from './db.server'
import { lists, shares, users } from './schema.server'

export async function createUser(input: typeof users.$inferInsert) {
	return await db.insert(users).values(input).returning({ insertedId: users.id })
}

export async function updateUser(
	id: string,
	input: Omit<Partial<typeof users.$inferInsert>, 'id'>
) {
	return await db.update(users).set(input).where(eq(users.id, id))
}

export async function deleteUser(id: string) {
	return await db.delete(users).where(eq(users.id, id))
}

export async function getListsForUser(userId: string) {
	return await db.select().from(lists).where(eq(lists.owner_id, userId))
}

export type MyList = Awaited<ReturnType<typeof getListsForUser>>[0]

export async function getListsSharedWithUser(userId: string) {
	return await db
		.select({
			id: lists.id,
			name: lists.name,
			description: lists.description,
		})
		.from(lists)
		.innerJoin(shares, eq(lists.id, shares.list_id))
		.where(eq(shares.shared_with_id, userId))
		.orderBy(desc(lists.created_at))
}

export type SharedList = Awaited<ReturnType<typeof getListsSharedWithUser>>[0]

export async function deleteList(id: number) {
	return await db.delete(lists).where(eq(lists.id, id))
}

export async function getListById(id: number) {
	const data = await db.select().from(lists).where(eq(lists.id, id))
	if (!data.length) {
		throw new Error(`No list found for id: ${id}`)
	}

	return data[0]
}
export async function createList(input: typeof lists.$inferInsert) {
	return await db.insert(lists).values(input).returning({ insertedId: lists.id })
}
