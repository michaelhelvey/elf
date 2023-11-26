/* eslint-disable no-console */
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ListById, ListItem } from '@/lib/crud.server'
import { PlusIcon, RowsIcon, Share2Icon, TrashIcon } from '@radix-ui/react-icons'
import { useFetcher } from '@remix-run/react'
import clsx from 'clsx'
import { useState } from 'react'
import { ListItemForm } from './list-item-form'

type OwnedListItemsDisplayProps = {
	listItems: ListItem[]
	list: ListById
}

async function getShareLink(listId: number) {
	const response = await fetch(`/lists/${listId}/shares/create`, { method: 'POST' })

	if (!response.ok) {
		throw new Error(`Failed to create share link: ${response.statusText}`)
	}

	const { shareURL } = (await response.json()) as { shareURL: string }
	return shareURL
}

async function copyTextToClipboard(listId: number) {
	if (typeof ClipboardItem && navigator.clipboard.write) {
		const text = new ClipboardItem({
			'text/plain': getShareLink(listId).then(
				text => new Blob([text], { type: 'text/plain' })
			),
		})
		return navigator.clipboard.write([text])
	} else {
		const shareURL = await getShareLink(listId)
		await navigator.clipboard.writeText(shareURL)
	}
}

export function OwnedListItemsDisplay({ list, listItems }: OwnedListItemsDisplayProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const { toast } = useToast()
	const [shareTokenState, setShareTokenState] = useState('idle')

	const generateShareLink = () => {
		setShareTokenState('loading')
		copyTextToClipboard(list.id)
			.then(() => {
				toast({
					title: 'Copied to clipboard',
					description:
						'Paste it somewhere and let others know about it! The link is valid for 24 hours.',
				})
				setShareTokenState('idle')
			})
			.catch(e => {
				const message = 'Failed to copy share link'
				const description = e instanceof Error ? e.message : String(e)
				toast({ title: message, description })
				setShareTokenState('idle')
			})
	}

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

			<Button
				variant='outline'
				className='mt-3 w-full'
				disabled={shareTokenState === 'loading'}
				onClick={generateShareLink}
			>
				<Share2Icon className='w-4 h-4 mr-2' />
				{shareTokenState === 'idle' ? 'Share Link' : <Spinner className='w-4 h-4' />}
			</Button>
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
					<div className='flex flex-1 items-start space-y-1 flex-col col-span-4 text-left'>
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
						<p className='text-sm text-muted-foreground'>
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
