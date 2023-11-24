import { ListById, createList, getListById, updateList } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { useFormSuccess } from '@/lib/useFormSuccess'
import { redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { z } from 'zod'
import { FormInput, SubmitButton } from './form'

export const newListSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Please enter a name' })
		.transform(val => val.trim()),
	description: z
		.string()
		.min(1, { message: 'Please enter a description' })
		.transform(val => val.trim()),
})

export const newListValidator = withZod(newListSchema)

export async function handleNewListCreateOrUpdate(
	userId: string,
	listId: number | undefined,
	formData: FormData
) {
	const result = await newListValidator.validate(formData)

	if (result.error) {
		logger.error({ msg: 'invalid form data', data: result })
		return validationError(result.error)
	}

	if (listId) {
		const list = await getListById(listId)
		if (!list) {
			throw new Response('Not Found', { status: 404 })
		}

		await updateList(listId, result.data)
		logger.info({ msg: 'successfully updated list', data: result.data })
		return redirect(`/lists/${listId}`)
	}

	const { newListId } = await createList({ owner_id: userId, ...result.data })
	logger.info({ msg: 'successfully created list', data: result.data })

	return redirect(`/lists/${newListId}`)
}

export function NewListForm({ list, onSuccess }: { list?: ListById; onSuccess?: () => void }) {
	const actionUrl = list ? `/lists/${list.id}` : '/lists'
	const fetcher = useFetcher()
	useFormSuccess(fetcher, onSuccess ?? (() => {}))

	return (
		<ValidatedForm
			method='POST'
			validator={newListValidator}
			defaultValues={list}
			fetcher={fetcher}
			action={actionUrl}
		>
			<input type='hidden' name='action' value={list ? 'create_list' : 'update_list'} />
			<div className='space-y-4'>
				<FormInput label='Name' name='name' />
				<FormInput label='Description' name='description' type='textarea' />
				<div className='flex justify-end'>
					<SubmitButton>{list ? 'Save' : 'Create'}</SubmitButton>
				</div>
			</div>
		</ValidatedForm>
	)
}
