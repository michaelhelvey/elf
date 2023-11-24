import { useField, useIsSubmitting } from 'remix-validated-form'
import { Spinner } from './spinner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export interface FormInputProps {
	label: string
	name: string
	type?: string
	placeholder?: string
}

export function FormInput({ label, name, placeholder, type = 'text' }: FormInputProps) {
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
			<Comp {...getInputProps({ id: name })} placeholder={placeholder ?? label} type={type} />
			{error && <span className='ml-px text-sm text-red-700'>{error}</span>}
		</div>
	)
}

export function SubmitButton({ children }: { children?: React.ReactNode }) {
	const isSubmitting = useIsSubmitting()

	return (
		<Button type='submit' disabled={isSubmitting}>
			{isSubmitting ? <Spinner className='h-3 w-3' /> : children}
		</Button>
	)
}
