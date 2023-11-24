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
import { dataFunctionAuthGuard } from '@/components/ui/utils'
import { deleteList, getItemsForList, getListById } from '@/lib/crud.server'
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

	if (list.owner_id !== userId) {
		return <div>Share view lol isnt it great</div>
	}

	return (
		<div className='flex flex-col items-center justify-center flex-1'>
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
