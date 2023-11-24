import { ListById, ListItem } from '@/lib/crud.server'
import { PlusIcon, RowsIcon, TrashIcon } from '@radix-ui/react-icons'
import { useFetcher } from '@remix-run/react'
import clsx from 'clsx'
import { useState } from 'react'
import { ListItemForm } from './list-item-form'
import { Spinner } from './spinner'
import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'

type ListItemsOwnerViewProps = {
	listItems: ListItem[]
	list: ListById
}

export function ListItemsOwnerView({ list, listItems }: ListItemsOwnerViewProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false)

	return (
		<>
			{listItems.length === 0 && (
				<div className='flex items-center justify-center flex-col p-8'>
					<RowsIcon className='text-muted-foreground w-5 h-5'></RowsIcon>
					<p className='text-sm text-muted-foreground mt-6'>
						You haven't added any items to this list yet.
					</p>
				</div>
			)}
			{listItems.map(item => (
				<ListItemEntry item={item} key={item.id} list={list} />
			))}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogTrigger asChild>
					<Button variant='outline' className='mt-3 w-full'>
						<PlusIcon className='w-4 h-4 mr-2' />
						New Item
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Item</DialogTitle>
						<DialogDescription>
							You're creating a new item in your list called "{list.name}"
						</DialogDescription>
					</DialogHeader>
					<Separator className='mb-3 mt-1'></Separator>
					<ListItemForm list={list} onSuccess={() => setEditDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	)
}

interface ListItemEntryProps {
	item: ListItem
	list: ListById
}

function ListItemEntry({ item, list }: ListItemEntryProps) {
	const fetcher = useFetcher()
	const [editDialogOpen, setEditDialogOpen] = useState(false)

	return (
		<div
			className={clsx(
				'grid grid-cols-8 space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground my-1 group opacity-100 mb-4',
				{ 'opacity-30': fetcher.state === 'submitting' }
			)}
		>
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogTrigger className='col-span-7 flex items-center justify-start'>
					{/* <Avatar className='rounded-sm mr-4 h-12 w-12'>
						<AvatarImage src={item.og_image_url ?? undefined} alt={item.name} />
						<AvatarFallback>
							<MagicWandIcon className='w-5 h-5 text-muted-foreground' />
						</AvatarFallback>
					</Avatar> */}
					<div className='flex flex-1 items-start space-y-1 flex-col col-span-4'>
						<p className='text-base font-semibold leading-none mb-1'>{item.name}</p>
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
							{item.description?.length
								? item.description
								: 'No description provided'}
						</p>
					</div>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Item</DialogTitle>
						<DialogDescription>
							You're editing the item "{item.name}" in list "{list.name}"
						</DialogDescription>
					</DialogHeader>
					<Separator className='mb-3 mt-1'></Separator>
					<ListItemForm
						list={list}
						listItem={item}
						onSuccess={() => setEditDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			<fetcher.Form
				method='DELETE'
				action={`/lists/${list.id}/items/${item.id}`}
				className='col-span-1'
			>
				<input type='hidden' name='listId' value={item.id} />
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
