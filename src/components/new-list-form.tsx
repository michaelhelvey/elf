import { createList } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { useFetcher } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { useEffect, useRef } from 'react'
import {
	ValidatedForm,
	useField,
	useFormContext,
	useIsSubmitting,
	validationError,
} from 'remix-validated-form'
import { z } from 'zod'
import { Spinner } from './spinner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

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

export async function handleNewListCreateRequest(userId: string, formData: FormData) {
	const result = await newListValidator.validate(formData)

	if (result.error) {
		logger.error({ msg: 'invalid form data', data: result })
		return validationError(result.error)
	}

	await createList({ owner_id: userId, ...result.data })
	logger.info({ msg: 'successfully created list', data: result.data })

	return null
}

interface NewListFormProps {
	onSubmit: () => void
}

export function NewListForm({ onSubmit }: NewListFormProps) {
	const fetcher = useFetcher()
	const lastState = useRef(fetcher.state)
	const formContext = useFormContext('create_list_form')

	// FIXME: there _has_ to be a better way to handle "on success" type of events in Remix...I'm
	// clearly not understanding something here
	useEffect(() => {
		if (fetcher.state === 'idle' && lastState.current === 'loading' && formContext.isValid) {
			onSubmit()
		}

		lastState.current = fetcher.state
	}, [fetcher.state, formContext.isValid, onSubmit])

	return (
		<ValidatedForm
			method='POST'
			validator={newListValidator}
			fetcher={fetcher}
			id='create_list_form'
		>
			<input type='hidden' name='action' value={'create_list'} />
			<div className='space-y-4'>
				<FormInput label='Name' name='name' />
				<FormInput label='Description' name='description' type='textarea' />
				<div className='flex justify-end'>
					<SubmitButton />
				</div>
			</div>
		</ValidatedForm>
	)
}

interface FormInputProps {
	label: string
	name: string
	type?: string
}

function FormInput({ label, name, type = 'text' }: FormInputProps) {
	const { error, getInputProps } = useField(name, {
		validationBehavior: {
			initial: 'onSubmit',
			whenTouched: 'onSubmit',
			whenSubmitted: 'onSubmit',
		},
	})
	const Comp = type === 'textarea' ? Textarea : Input
	return (
		<div>
			<Comp {...getInputProps({ id: name })} placeholder={label} type={type} />
			{error && <span className='ml-px text-sm text-red-700'>{error}</span>}
		</div>
	)
}

function SubmitButton() {
	const isSubmitting = useIsSubmitting()

	return (
		<Button type='submit' disabled={isSubmitting}>
			{isSubmitting ? <Spinner className='h-3 w-3' /> : 'Create'}
		</Button>
	)
}
