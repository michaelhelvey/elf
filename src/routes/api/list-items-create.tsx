import { createListItem, getListById } from '@/lib/crud.server'
import { extractOgImageFromUrl } from '@/lib/image-extractor.server'
import { listItems } from '@/lib/schema.server'
import { listItemFieldsValidator } from '@/routes//list-detail/components/list-item-form'
import { ActionFunctionArgs } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

/**
 * /lists/:listId/items/create API endpoint
 */
export const action = async (args: ActionFunctionArgs) => {
	const rawFormData = await args.request.formData()
	const listId = parseInt(args.params.listId as string)

	const list = await getListById(listId)

	if (!list) {
		throw new Response('Not Found', { status: 404 })
	}

	switch (args.request.method) {
		case 'POST': {
			const form = await listItemFieldsValidator.validate(rawFormData)

			if (form.error) {
				return validationError(form.error)
			}

			const createInput: typeof listItems.$inferInsert = form.data
			if (form.data.link) {
				createInput.og_image_url = await extractOgImageFromUrl(form.data.link)
			}

			await createListItem(listId, createInput)
			return new Response(null, { status: 201 })
		}
		default:
			throw new Response('Method Not Allowed', { status: 405 })
	}
}
