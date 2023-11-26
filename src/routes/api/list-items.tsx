import { deletelistItem, getListById, getListItemById, updateListItem } from '@/lib/crud.server'
import { extractOgImageFromUrl } from '@/lib/image-extractor.server'
import { listItems } from '@/lib/schema.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { listItemFieldsValidator } from '@/routes//list-detail/components/list-item-form'
import { ActionFunctionArgs } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

async function handleDeleteListItem(itemId: number) {
	const listItem = await getListItemById(itemId)

	if (!listItem) {
		throw new Response('Not Found', { status: 404 })
	}

	await deletelistItem(itemId)
}

/**
 * /lists/:id/items/:listItemId API endpoint
 */
export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const { listId, listItemId } = args.params as { listId: string; listItemId: string }
	const list = await getListById(parseInt(listId))
	const listItem = await getListItemById(parseInt(listItemId))

	// FIXME: need to check that the list item is in the list
	if (!list || !listItem) {
		throw new Response('Not Found', { status: 404 })
	}

	if (list.owner.id !== userId) {
		throw new Response('Forbidden', { status: 403 })
	}

	switch (args.request.method) {
		case 'DELETE': {
			await handleDeleteListItem(listItem.id)
			return new Response(null, { status: 204 })
		}
		case 'POST': {
			// List item update request
			const form = await listItemFieldsValidator.validate(await args.request.formData())
			if (form.error) {
				throw validationError(form.error)
			}

			const updateInput: typeof listItems.$inferInsert = form.data

			if (!listItem.og_image_url && listItem.link) {
				updateInput.og_image_url = await extractOgImageFromUrl(listItem.link)
			}

			await updateListItem(listItem.id, updateInput)
			return new Response(null, { status: 200 })
		}
		default: {
			throw new Error('unhandled method')
		}
	}
}
