import {
	ListById,
	ListItem,
	createListItem,
	getlistItemById,
	updateListItem,
} from '@/lib/crud.server'
import { extractOgImageFromUrl } from '@/lib/image-extractor.server'
import { logger } from '@/lib/logger.server'
import { listItems } from '@/lib/schema.server'
import { useFormSuccess } from '@/lib/useFormSuccess'
import { useFetcher } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { z } from 'zod'
import { FormInput, SubmitButton } from './form'

export const listItemFormValidator = withZod(
	z.object({
		name: z.string().min(1, { message: 'name must be at least 1 character' }).max(50),
		link: z
			.string()
			.nullable()
			.refine(
				val => {
					if (!val) return true

					return z.string().url().safeParse(val).success
				},
				{ message: 'link must be a valid URL' }
			),
		description: z.string().max(250).nullable(),
	})
)

export async function handleUpdateOrCreateListItem(
	listId: number,
	listItemId: number | undefined,
	request: Request
) {
	const formData = await request.formData()
	const form = await listItemFormValidator.validate(formData)
	logger.info(form)

	if (form.error) {
		throw validationError(form.error)
	}

	if (listItemId) {
		const listItem = await getlistItemById(listItemId)
		if (!listItem) {
			throw new Response('Not Found', { status: 404 })
		}

		const updateInput: typeof listItems.$inferInsert = form.data

		if (!listItem.og_image_url && listItem.link) {
			updateInput.og_image_url = await extractOgImageFromUrl(listItem.link)
		}

		await updateListItem(listItemId, updateInput)
	} else {
		const createInput: typeof listItems.$inferInsert = form.data
		if (form.data.link) {
			createInput.og_image_url = await extractOgImageFromUrl(form.data.link)
		}

		await createListItem(listId, createInput)
	}
}

interface ListItemFormProps {
	list: ListById
	listItem?: ListItem
	onSuccess?: () => void
}

export function ListItemForm({ list, listItem, onSuccess }: ListItemFormProps) {
	const actionURL = listItem
		? `/lists/${list.id}/items/${listItem.id}`
		: `/lists/${list.id}/items/`

	const fetcher = useFetcher()
	useFormSuccess(fetcher, onSuccess ?? (() => {}))

	return (
		<ValidatedForm
			method='PUT'
			validator={listItemFormValidator}
			action={actionURL}
			fetcher={fetcher}
			defaultValues={listItem}
		>
			<div className='space-y-4'>
				<FormInput label='Name' name='name' />
				<FormInput label='Link' name='link' />
				<FormInput label='Description' name='description' type='textarea' />
				<div className='flex justify-end'>
					<SubmitButton>{listItem ? 'Save' : 'Create'}</SubmitButton>
				</div>
			</div>
		</ValidatedForm>
	)
}
