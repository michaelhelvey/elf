import { NewListForm, handleNewListCreateOrUpdate } from '@/components/list-form'
import { ListItemsOwnerView } from '@/components/list-items-owner-view'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { deleteList, getItemsForList, getListById, isListSharedWithUser } from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ok as invariant } from 'assert'
import { useState } from 'react'

export const loader = async (args: LoaderFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = args.params.listId
	invariant(listId, 'expected list id route param')

	const list = await getListById(parseInt(listId))
	const listItems = await getItemsForList(parseInt(listId))

	if (userId !== list.owner_id && !(await isListSharedWithUser(list.id, userId))) {
		throw new Response('Forbidden', { status: 403 })
	}

	return {
		list,
		listItems,
		userId,
	}
}

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = args.params.listId
	invariant(listId, 'expected list id route param')

	const list = await getListById(parseInt(listId))

	switch (args.request.method) {
		case 'DELETE': {
			if (userId !== list.owner_id) {
				return new Response('Forbidden', { status: 403 })
			}

			await deleteList(parseInt(listId))
			return redirect('/')
		}
		case 'POST': {
			if (userId !== list.owner_id) {
				return new Response('Forbidden', { status: 403 })
			}

			return await handleNewListCreateOrUpdate(
				userId,
				parseInt(listId),
				await args.request.formData()
			)
		}
	}
}

export default function ListDetailPage() {
	const { list, listItems, userId } = useLoaderData<typeof loader>()
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const { toast } = useToast()

	if (list.owner_id !== userId) {
		return <div>Share view lol isnt it great</div>
	}

	const generateShareLink = async () => {
		try {
			const response = await fetch(`/shares/${list.id}/new`, { method: 'POST' })
			if (!response.ok) {
				throw new Error(response.statusText)
			}

			const { shareURL } = (await response.json()) as { shareURL: string }
			await navigator.clipboard.writeText(shareURL)

			toast({
				title: 'Copied to clipboard',
				description:
					'Paste it somewhere and let others know about it! The link is valid for 24 hours.',
			})
		} catch (e) {
			const message = 'Failed to copy share link'
			const description = e instanceof Error ? e.message : String(e)

			toast({ title: message, description })
		}
	}

	return (
		<div className='flex flex-col items-center justify-center flex-1 p-2'>
			<Card className='w-full max-w-lg'>
				<div className='flex items-center justify-between w-full'>
					<CardHeader>
						<CardTitle>{list.name}</CardTitle>
						<CardDescription>{list.description}</CardDescription>
					</CardHeader>
					<div className='p-6'>
						<DropdownMenu>
							<DropdownMenuTrigger className='hover:bg-accent p-3 rounded'>
								<DotsHorizontalIcon height={16} width={16} />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
									Edit List
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => void generateShareLink()}>
									Copy Share Link
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<CardContent>
					<Separator className='mb-5'></Separator>
					<ListItemsOwnerView listItems={listItems} list={list} />
				</CardContent>
			</Card>
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create list</DialogTitle>
						<DialogDescription>
							You're editing your list called "{list.name}"
						</DialogDescription>
					</DialogHeader>
					<NewListForm list={list} onSuccess={() => setEditDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</div>
	)
}
