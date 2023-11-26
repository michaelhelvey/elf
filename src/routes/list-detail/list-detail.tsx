import { Avatar, AvatarImage } from '@/components/ui/avatar'
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
import {
	deleteList,
	getItemsForList,
	getListById,
	getUsersListIsSharedWith,
	isListSharedWithUser,
	updateList,
} from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { DotsHorizontalIcon, PersonIcon, RowsIcon } from '@radix-ui/react-icons'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ok as invariant } from 'assert'
import { useState } from 'react'
import { validationError } from 'remix-validated-form'
import { ListForm, listFieldsValidator } from '../home/components/list-form'
import { OwnedListItemsDisplay } from './components/owned-list-items-display'
import { SharedListItemDisplay } from './components/shared-list-item-display'

export const loader = async (args: LoaderFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = args.params.listId
	invariant(listId, 'expected list id route param')

	const list = await getListById(parseInt(listId))

	if (!list) {
		throw new Response('Not Found', { status: 404 })
	}

	const listItems = await getItemsForList(list.id)
	const sharedWithUsers = await getUsersListIsSharedWith(list.id)

	if (userId !== list.owner.id && !(await isListSharedWithUser(list.id, userId))) {
		throw new Response('Forbidden', { status: 403 })
	}

	return {
		list,
		listItems,
		sharedWithUsers,
		userId,
	}
}

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = args.params.listId
	invariant(listId, 'expected list id route param')

	const list = await getListById(parseInt(listId))

	if (!list) {
		throw new Response('Not Found', { status: 404 })
	}

	switch (args.request.method) {
		case 'DELETE': {
			if (userId !== list.owner.id) {
				return new Response('Forbidden', { status: 403 })
			}

			await deleteList(parseInt(listId))
			return redirect('/')
		}
		case 'POST': {
			// List update action:
			if (userId !== list.owner.id) {
				return new Response('Forbidden', { status: 403 })
			}

			const formData = await args.request.formData()
			const result = await listFieldsValidator.validate(formData)

			if (result.error) {
				logger.error({ msg: 'invalid form data', data: result })
				return validationError(result.error)
			}

			await updateList(list.id, result.data)
			logger.info({ msg: 'successfully updated list', data: result.data })
			return redirect(`/lists/${listId}`)
		}
	}
}

export default function ListDetailPage() {
	const { list, userId } = useLoaderData<typeof loader>()
	if (list.owner.id !== userId) {
		return <ListDetailShareView />
	}

	return <ListDetailOwnerView />
}

function ListDetailShareView() {
	const { list, listItems, userId } = useLoaderData<typeof loader>()
	return (
		<div className='flex flex-col items-center justify-center flex-1 p-2'>
			<Card className='w-full max-w-lg'>
				<div className='flex items-center justify-between w-full'>
					<CardHeader>
						<div className='text-xs bg-secondary text-secondary-foreground py-2 px-3 rounded-md flex items-center mb-2'>
							<Avatar className='w-5 h-5 mr-1'>
								<AvatarImage
									src={list.owner.avatar_url ?? undefined}
									alt={list.owner.name}
								/>
								<AvatarFallback>
									<PersonIcon className='w-full h-full p-1 bg-stone-500 text-white' />
								</AvatarFallback>
							</Avatar>
							<p>
								Shared with you by
								<span className='font-semibold text-accent-foreground'>
									{' ' + list.owner.name}
								</span>
							</p>
						</div>
						<CardTitle>{list.name}</CardTitle>
						<CardDescription>{list.description}</CardDescription>
					</CardHeader>
				</div>
				<CardContent>
					<Separator className='mb-5'></Separator>
					{listItems.map(item => (
						<SharedListItemDisplay
							item={item}
							key={item.id}
							list={list}
							currentUserId={userId}
						/>
					))}
					{listItems.length === 0 && (
						<div className='flex items-center justify-center flex-col p-8'>
							<RowsIcon className='text-muted-foreground w-5 h-5'></RowsIcon>
							<p className='text-sm text-muted-foreground mt-6 text-center'>
								For some reason, {list.owner.name} shared this list without putting
								any items in it first.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

function ListDetailOwnerView() {
	const { list, listItems, sharedWithUsers } = useLoaderData<typeof loader>()
	const [editDialogOpen, setEditDialogOpen] = useState(false)

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
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<CardContent>
					{sharedWithUsers.length > 0 && (
						<div className='text-xs mb-4 -mt-2 flex items-center justify-start gap-2 flex-wrap text-muted-foreground'>
							Shared with:{' '}
							{sharedWithUsers.map(user => (
								<div
									className='bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center'
									key={user.id}
								>
									<Avatar className='w-4 h-4 mr-1'>
										<AvatarImage
											src={user.avatar_url ?? undefined}
											alt={user.name}
										/>
										<AvatarFallback>
											<PersonIcon className='w-full h-full p-1 bg-stone-500 text-white' />
										</AvatarFallback>
									</Avatar>
									<span className='whitespace-nowrap'>{user.name}</span>
								</div>
							))}
						</div>
					)}
					{sharedWithUsers.length === 0 && (
						<div className='text-xs mb-4 -mt-2 flex items-center justify-start gap-2 flex-wrap text-muted-foreground'>
							No one has clicked on a share link for this list yet.
						</div>
					)}
					<Separator className='mb-5'></Separator>
					<OwnedListItemsDisplay listItems={listItems} list={list} />
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
					<ListForm list={list} onSuccess={() => setEditDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</div>
	)
}
