import { desc, eq } from 'drizzle-orm'
import { db } from './db.server'
import { listItems, lists, shares, users } from './schema.server'

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

export type ListById = Awaited<ReturnType<typeof getListById>>

export async function getListById(id: number) {
	const data = await db.select().from(lists).where(eq(lists.id, id))
	if (!data.length) {
		throw new Error(`No list found for id: ${id}`)
	}

	return data[0]
}

export async function createList(input: typeof lists.$inferInsert) {
	const rows = await db.insert(lists).values(input).returning({ newListId: lists.id })
	return rows[0]
}

export async function updateList(
	listId: number,
	input: Omit<Partial<typeof lists.$inferInsert>, 'id'>
) {
	return await db.update(lists).set(input).where(eq(lists.id, listId))
}

export type ListItem = Awaited<ReturnType<typeof getItemsForList>>[0]

export async function getItemsForList(listId: number) {
	return await db
		.select({
			id: listItems.id,
			name: listItems.name,
			link: listItems.link,
			og_image_url: listItems.og_image_url,
			description: listItems.description,
		})
		.from(lists)
		.innerJoin(listItems, eq(lists.id, listItems.list_id))
		.where(eq(lists.id, listId))
		.orderBy(desc(listItems.created_at))
}

export async function getlistItemById(id: number) {
	const rows = await db.select().from(listItems).where(eq(listItems.id, id)).limit(1)
	return rows[0]
}

export async function updateListItem(
	itemId: number,
	input: Omit<Partial<typeof listItems.$inferInsert>, 'id'>
) {
	return await db.update(listItems).set(input).where(eq(listItems.id, itemId))
}

export async function createListItem(listId: number, input: typeof listItems.$inferInsert) {
	const rows = await db
		.insert(listItems)
		.values({ ...input, list_id: listId })
		.returning({ newItemId: listItems.id })
	return rows[0]
}

export async function deletelistItem(id: number) {
	return await db.delete(listItems).where(eq(listItems.id, id))
}
