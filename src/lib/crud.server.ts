import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from './db.server'
import { listItems, lists, shareTokens, shares, users } from './schema.server'
import { ShareTokenResult } from './shared-types'

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
	return await db
		.select()
		.from(lists)
		.where(eq(lists.owner_id, userId))
		.orderBy(desc(lists.updated_at))
}

export type OwnedList = Awaited<ReturnType<typeof getListsForUser>>[0]

export async function getListsSharedWithUser(userId: string) {
	return await db
		.select({
			id: lists.id,
			name: lists.name,
			description: lists.description,
			updated_at: lists.updated_at,
			owner: {
				id: users.id,
				first_name: users.first_name,
				last_name: users.last_name,
				name: sql<string>`concat(${users.first_name}, ' ', ${users.last_name})`,
				email: users.email,
				avatar_url: users.avatar_url,
			},
		})
		.from(lists)
		.innerJoin(shares, eq(lists.id, shares.list_id))
		.innerJoin(users, eq(lists.owner_id, users.id))
		.where(eq(shares.shared_with_id, userId))
		.orderBy(desc(lists.updated_at))
}

export type SharedList = Awaited<ReturnType<typeof getListsSharedWithUser>>[0]

export async function deleteList(id: number) {
	return await db.delete(lists).where(eq(lists.id, id))
}

export type ListById = Awaited<ReturnType<typeof getListById>>

export async function getListById(id: number) {
	const data = await db
		.select({
			id: lists.id,
			name: lists.name,
			description: lists.description,
			owner: {
				id: users.id,
				first_name: users.first_name,
				last_name: users.last_name,
				name: sql<string>`concat(${users.first_name}, ' ', ${users.last_name})`,
				email: users.email,
				avatar_url: users.avatar_url,
			},
		})
		.from(lists)
		.innerJoin(users, eq(lists.owner_id, users.id))
		.where(eq(lists.id, id))
		.limit(1)

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
	return await db
		.update(lists)
		.set({ ...input, updated_at: new Date() })
		.where(eq(lists.id, listId))
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
			purchased_by: {
				id: users.id,
				first_name: users.first_name,
				last_name: users.last_name,
				name: sql<string>`concat(${users.first_name}, ' ', ${users.last_name})`,
				email: users.email,
				avatar_url: users.avatar_url,
			},
		})
		.from(lists)
		.innerJoin(listItems, eq(lists.id, listItems.list_id))
		.leftJoin(users, eq(users.id, listItems.purchased_by))
		.where(eq(lists.id, listId))
		.orderBy(desc(listItems.created_at))
}

export async function getListItemById(id: number) {
	const rows = await db.select().from(listItems).where(eq(listItems.id, id)).limit(1)
	return rows[0]
}

export async function updateListItem(
	itemId: number,
	input: Omit<Partial<typeof listItems.$inferInsert>, 'id'>
) {
	return await db
		.update(listItems)
		.set({ ...input, updated_at: new Date() })
		.where(eq(listItems.id, itemId))
}

export async function createListItem(listId: number, input: typeof listItems.$inferInsert) {
	const rows = await db
		.insert(listItems)
		.values({ ...input, list_id: listId })
		.returning({ newItemId: listItems.id })

	// bump the list to the top of people's share lists
	await db.update(lists).set({ updated_at: new Date() }).where(eq(lists.id, listId))
	return rows[0]
}

export async function deletelistItem(id: number) {
	return await db.delete(listItems).where(eq(listItems.id, id))
}

export async function createShareToken(listId: number) {
	// date 24 hours in the future:
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
	const rows = await db
		.insert(shareTokens)
		.values({
			list_id: listId,
			expires_at: expiresAt,
			token: sql`gen_random_uuid()`,
		})
		.returning({ newToken: shareTokens.token })
	return rows[0]
}

export async function validateAndAssociateShareToken(userId: string, _token: string) {
	const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
	if (!user.length) {
		return { result: ShareTokenResult.USER_NOT_FOUND }
	}

	const rows = await db.select().from(shareTokens).where(eq(shareTokens.token, _token)).limit(1)
	const token = rows[0]

	if (!token) {
		return { result: ShareTokenResult.NOT_FOUND }
	}

	if (new Date(token.expires_at) < new Date()) {
		return { result: ShareTokenResult.TOKEN_EXPIRED }
	}

	const list = await getListById(token.list_id)
	if (list.owner.id === userId) {
		return { result: ShareTokenResult.SELF_SHARE }
	}

	const existingShare = await db
		.select()
		.from(shares)
		.where(and(eq(shares.list_id, token.list_id), eq(shares.shared_with_id, userId)))
		.limit(1)

	if (existingShare.length) {
		return { result: ShareTokenResult.ALREADY_ACTIVATED }
	}

	await db.insert(shares).values({
		list_id: token.list_id,
		shared_with_id: userId,
	})

	return { result: ShareTokenResult.SUCCESS, listId: token.list_id }
}

export async function isListSharedWithUser(listId: number, userId: string) {
	const rows = await db
		.select()
		.from(shares)
		.where(and(eq(shares.list_id, listId), eq(shares.shared_with_id, userId)))
		.limit(1)

	return !!rows.length
}

export async function setPurchasedByForListItem(itemId: number, userId: string | null) {
	return await db.update(listItems).set({ purchased_by: userId }).where(eq(listItems.id, itemId))
}

export async function getUsersListIsSharedWith(listId: number) {
	return await db
		.select({
			id: users.id,
			first_name: users.first_name,
			last_name: users.last_name,
			name: sql<string>`concat(${users.first_name}, ' ', ${users.last_name})`,
			email: users.email,
			avatar_url: users.avatar_url,
		})
		.from(shares)
		.innerJoin(users, eq(shares.shared_with_id, users.id))
		.where(eq(shares.list_id, listId))
}
