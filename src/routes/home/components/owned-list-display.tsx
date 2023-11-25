import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { OwnedList } from '@/lib/crud.server'
import { TrashIcon } from '@radix-ui/react-icons'
import { SerializeFrom } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import clsx from 'clsx'

export function OwnedListDisplay({
	list: { id, name, description },
}: {
	list: SerializeFrom<OwnedList>
}) {
	const fetcher = useFetcher()

	return (
		<div
			className={clsx(
				'flex items-start justify-between space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground my-1 group opacity-100',
				{ 'opacity-30': fetcher.state === 'submitting' }
			)}
		>
			<Link to={`/lists/${id}`} className={clsx('space-y-1 flex-1')}>
				<p className='text-sm font-medium leading-none'>{name}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</Link>
			<fetcher.Form method='DELETE' action={`/lists/${id}`}>
				<input type='hidden' name='listId' value={id} />
				<Button
					type='submit'
					size='icon'
					variant='outline'
					className='hover:bg-destructive hover:text-destructive-foreground active:bg-destructive/90 active:text-destructive-foreground/90'
					disabled={fetcher.state === 'submitting'}
				>
					{fetcher.state === 'submitting' ? (
						<Spinner className='w-4 h-4' />
					) : (
						<TrashIcon />
					)}
				</Button>
			</fetcher.Form>
		</div>
	)
}
