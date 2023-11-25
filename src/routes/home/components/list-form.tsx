import { FormInput, SubmitButton } from '@/components/form'
import { ListById } from '@/lib/crud.server'
import { useFormSuccess } from '@/lib/useFormSuccess'
import { useFetcher } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm } from 'remix-validated-form'
import { z } from 'zod'

export const listFieldsSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Please enter a name' })
		.transform(val => val.trim()),
	description: z
		.string()
		.min(1, { message: 'Please enter a description' })
		.transform(val => val.trim()),
})

export const listFieldsValidator = withZod(listFieldsSchema)

/**
 * Create or Update list component
 */
export function ListForm({ list, onSuccess }: { list?: ListById; onSuccess?: () => void }) {
	const actionUrl = list ? `/lists/${list.id}` : '/lists/create'
	const fetcher = useFetcher()
	useFormSuccess(fetcher, onSuccess ?? (() => {}))

	return (
		<ValidatedForm
			method='POST'
			validator={listFieldsValidator}
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
