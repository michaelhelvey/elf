import { MyList, deleteList, getListById } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { TrashIcon } from '@radix-ui/react-icons'
import { Link, useFetcher } from '@remix-run/react'
import clsx from 'clsx'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Spinner } from './spinner'
import { Button } from './ui/button'

const deleteListSchema = zfd.formData({
	listId: zfd.numeric(z.coerce.number()),
})

export async function handleDeleteListRequest(userId: string, formData: FormData) {
	const form = deleteListSchema.safeParse(formData)

	if (!form.success) {
		logger.error({ msg: 'invalid form data', data: form })
		throw new Response('invalid delete list request', {
			status: 400,
		})
	}

	const listId = form.data.listId
	const list = await getListById(listId)

	if (list.owner_id !== userId) {
		logger.error({ msg: 'user does not own list', listId, userId })
		throw new Response('You do not have permission to delete this list', {
			status: 403,
		})
	}

	await deleteList(listId)

	return null
}

export function MyListEntry({ list: { id, name, description } }: { list: MyList }) {
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
