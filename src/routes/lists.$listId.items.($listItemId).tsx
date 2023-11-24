import { handleUpdateOrCreateListItem } from '@/components/list-item-form'
import { dataFunctionAuthGuard } from '@/components/ui/utils'
import { deletelistItem, getListById, getlistItemById } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { ok } from 'assert'

async function handleDeleteListItem(itemId: number) {
	const listItem = await getlistItemById(itemId)

	if (!listItem) {
		throw new Response('Not Found', { status: 404 })
	}

	await deletelistItem(itemId)
}

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	// safety: remix routing presumably isn't buggy
	const { listId, listItemId } = args.params as { listId: string; listItemId: string | undefined }
	logger.info({
		msg: 'received request at /lists/:id/items/:listItemId',
		method: args.request.method,
		data: { listId, listItemId },
	})

	const list = await getListById(parseInt(listId))

	if (!list) {
		throw new Response('Not Found', { status: 404 })
	}

	if (list.owner_id !== userId) {
		throw new Response('Forbidden', { status: 403 })
	}

	switch (args.request.method) {
		case 'DELETE': {
			ok(listItemId)
			await handleDeleteListItem(parseInt(listItemId))
			break
		}
		case 'PUT': {
			await handleUpdateOrCreateListItem(
				list.id,
				listItemId ? parseInt(listItemId) : undefined,
				args.request
			)
			break
		}
		default: {
			throw new Error('unhandled method')
		}
	}

	return redirect(`/lists/${listId}`)
}
