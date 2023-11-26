import {
	getListById,
	getListItemById,
	isListSharedWithUser,
	setPurchasedByForListItem,
} from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { ActionFunctionArgs } from '@remix-run/node'
import { ok } from 'assert'

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = args.params.listId
	const listItemId = args.params.listItemId

	ok(listId, 'expected list id route param')
	ok(listItemId, 'expected list item id route param')

	const list = await getListById(parseInt(listId))
	// FIXME: check if list item is in list
	const listItem = await getListItemById(parseInt(listItemId))

	if (!list) {
		throw new Response('Not Found', { status: 404 })
	}

	if (!listItem) {
		throw new Response('Not Found', { status: 404 })
	}

	const isShared = await isListSharedWithUser(list.id, userId)
	if (!isShared) {
		return new Response('Forbidden', { status: 403 })
	}

	switch (args.request.method) {
		case 'POST': {
			// Users can toggle their own purchase state off:
			if (listItem.purchased_by === userId) {
				await setPurchasedByForListItem(listItem.id, null)
			} else if (listItem.purchased_by === null) {
				await setPurchasedByForListItem(listItem.id, userId)
			} else {
				// then it was marked as purchased by someone else, which means other users aren't allowed
				// to call this route anymore
				return new Response('Already purchased by another user', { status: 409 })
			}

			return new Response('', { status: 200 })
		}
		default: {
			return new Response('Method Not Allowed', { status: 405 })
		}
	}
}
