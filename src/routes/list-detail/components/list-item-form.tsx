import { FormInput, SubmitButton } from '@/components/form'
import { ListById, ListItem } from '@/lib/crud.server'
import { useFormSuccess } from '@/lib/useFormSuccess'
import { useFetcher } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm } from 'remix-validated-form'
import { z } from 'zod'

export const listItemFieldsSchema = z.object({
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

export const listItemFieldsValidator = withZod(listItemFieldsSchema)

interface ListItemFormProps {
	list: ListById
	listItem?: ListItem
	onSuccess?: () => void
}

export function ListItemForm({ list, listItem, onSuccess }: ListItemFormProps) {
	const actionURL = listItem
		? `/lists/${list.id}/items/${listItem.id}`
		: `/lists/${list.id}/items/create`

	const fetcher = useFetcher()
	useFormSuccess(fetcher, onSuccess ?? (() => {}))

	return (
		<ValidatedForm
			method='POST'
			validator={listItemFieldsValidator}
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
