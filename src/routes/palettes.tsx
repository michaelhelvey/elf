import { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = () => {
	if (process.env.NODE_ENV !== 'development') {
		return new Response('Not Found', { status: 404 })
	}

	return null
}

export default function Colors() {
	return (
		<div className='flex flex-col flex-1 container p-6'>
			<h1>Colors</h1>

			<div className='flex flex-wrap gap-4'>
				<div className='w-24 h-24 bg-primary rounded shadow-sm text-sm grid place-items-center text-primary-foreground'>
					primary
				</div>
				<div className='w-24 h-24 bg-secondary rounded shadow-sm text-sm grid place-items-center text-secondary-foreground'>
					secondary
				</div>
				<div className='w-24 h-24 bg-muted rounded shadow-sm text-sm grid place-items-center text-muted-foreground'>
					muted
				</div>
				<div className='w-24 h-24 bg-accent rounded shadow-sm text-sm grid place-items-center text-accent-foreground'>
					accent
				</div>
				<div className='w-24 h-24 bg-destructive rounded shadow-sm text-sm grid place-items-center text-destructive-foreground'>
					destructive
				</div>
			</div>
		</div>
	)
}
