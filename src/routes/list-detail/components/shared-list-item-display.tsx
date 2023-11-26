import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ListById, ListItem } from '@/lib/crud.server'
import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useFetcher } from '@remix-run/react'
import clsx from 'clsx'

interface SharedListItemDisplayProps {
	item: ListItem
	list: ListById
	currentUserId: string
}

enum PurchasedState {
	NotPurchased,
	PurchasedByCurrentUser,
	PurchasedByOtherUser,
}

const determinePurchaseState = (item: ListItem, userId: string) => {
	if (item.purchased_by === null) {
		return PurchasedState.NotPurchased
	} else if (item.purchased_by.id === userId) {
		return PurchasedState.PurchasedByCurrentUser
	} else {
		return PurchasedState.PurchasedByOtherUser
	}
}

export function SharedListItemDisplay({ item, list, currentUserId }: SharedListItemDisplayProps) {
	const fetcher = useFetcher()
	const purchaseState = determinePurchaseState(item, currentUserId)

	return (
		<div
			className={clsx(
				'grid grid-cols-8 space-x-4 rounded-md p-2 transition-all my-1 group opacity-100 mb-4 last:mb-0',
				{ 'opacity-70': purchaseState === PurchasedState.PurchasedByOtherUser }
			)}
		>
			<div className='flex flex-1 items-start space-y-1 flex-col col-span-7'>
				<p className='text-base font-semibold leading-none mb-1 flex items-center'>
					{item.name}
					{purchaseState === PurchasedState.PurchasedByCurrentUser && (
						<span className='ml-2 text-xs bg-secondary text-secondary-foreground font-semibold px-2 py-1 rounded-md flex items-center'>
							<CheckIcon className='w-4 h-4 mr-1 text-green-600' />
							Purchased by you
						</span>
					)}
					{purchaseState === PurchasedState.PurchasedByOtherUser && (
						<span className='ml-2 text-xs bg-secondary text-secondary-foreground font-semibold px-2 py-1 rounded-md flex items-center'>
							<CheckIcon className='w-4 h-4 mr-1 text-green-600' />
							Purchased by {item.purchased_by?.name}
						</span>
					)}
				</p>
				{item.link && (
					<a
						href={item.link}
						className='text-sm text-blue-600 hover:underline overflow-ellipsis'
						target='_blank'
						rel='noreferrer'
						onClick={e => e.stopPropagation()}
					>
						{item.link.length > 45 ? item.link.slice(0, 45) + '...' : item.link}
					</a>
				)}
				<p className='text-sm text-muted-foreground text-left'>
					{item.description?.length ? item.description : 'No description provided'}
				</p>
			</div>
			{(purchaseState === PurchasedState.PurchasedByCurrentUser ||
				purchaseState === PurchasedState.NotPurchased) && (
				<fetcher.Form
					method='POST'
					action={`/lists/${list.id}/items/${item.id}/toggle-purchased`}
					className='col-span-1'
				>
					<input type='hidden' name='listId' value={item.id} />
					<Tooltip>
						<TooltipTrigger>
							<Button
								type='submit'
								size='icon'
								variant='outline'
								disabled={fetcher.state === 'submitting'}
							>
								{fetcher.state === 'submitting' ? (
									<Spinner className='w-4 h-4' />
								) : (
									<>
										{purchaseState === PurchasedState.NotPurchased ? (
											<CheckIcon />
										) : (
											<Cross1Icon />
										)}
									</>
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								{purchaseState === PurchasedState.NotPurchased ? 'Mark' : 'Unmark'}{' '}
								as purchased
							</p>
						</TooltipContent>
					</Tooltip>
				</fetcher.Form>
			)}
		</div>
	)
}
