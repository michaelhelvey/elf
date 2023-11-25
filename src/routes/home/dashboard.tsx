import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { OwnedList, SharedList } from '@/lib/crud.server'
import { SignedIn } from '@clerk/remix'
import { RowsIcon, Share1Icon } from '@radix-ui/react-icons'
import { SerializeFrom } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ListForm } from './components/list-form'
import { OwnedListDisplay } from './components/owned-list-display'
import { loader } from './home'

export function DashboardPage() {
	const { myLists, sharedLists } = useLoaderData<typeof loader>()

	return (
		<SignedIn>
			<section className='flex-1 flex flex-col items-center justify-center p-2 gap-4'>
				<MyLists lists={myLists} />
				<SharedLists lists={sharedLists} />
			</section>
		</SignedIn>
	)
}

interface MyListsProps {
	lists: SerializeFrom<OwnedList>[]
}

export function MyLists({ lists }: MyListsProps) {
	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<CardTitle>Your Lists</CardTitle>
				<CardDescription>lists you've created</CardDescription>
			</CardHeader>
			<CardContent>
				<Separator className='mb-5'></Separator>
				{lists.length === 0 && (
					<div className='flex items-center justify-center flex-col p-8'>
						<RowsIcon className='text-muted-foreground w-5 h-5'></RowsIcon>
						<p className='text-sm text-muted-foreground mt-6'>
							you haven't created any lists yet
						</p>
					</div>
				)}
				{lists.map(list => (
					<OwnedListDisplay list={list} key={list.id} />
				))}
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='default' className='mt-3 w-full'>
							Create a new list
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create list</DialogTitle>
							<DialogDescription>
								Create a new list that you can share with others via a link
							</DialogDescription>
						</DialogHeader>
						<ListForm />
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	)
}

interface SharedListsProps {
	lists: SharedList[]
}

const ownerInitials = (owner: SharedList['owner']) => {
	const firstInitial = owner.first_name?.[0] ?? ''
	const lastInitial = owner.last_name?.[0] ?? ''
	return firstInitial + lastInitial
}

export function SharedLists({ lists }: SharedListsProps) {
	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<CardTitle>Shared With You</CardTitle>
				<CardDescription>links to lists that others sent to you</CardDescription>
			</CardHeader>
			<CardContent>
				<Separator className='mb-5'></Separator>
				{lists.length === 0 && (
					<div className='flex items-center justify-center flex-col p-8'>
						<Share1Icon className='text-muted-foreground w-5 h-5'></Share1Icon>
						<p className='text-sm text-muted-foreground mt-6'>
							you haven't clicked on any share links yet
						</p>
					</div>
				)}
				{lists.map(({ name, description, id, owner }) => (
					<Link
						className='flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground my-1'
						key={id}
						to={`/lists/${id}`}
					>
						<Avatar>
							<AvatarImage src={owner.avatar_url ?? undefined}></AvatarImage>
							<AvatarFallback>{ownerInitials(owner)}</AvatarFallback>
						</Avatar>
						<div className='space-y-1'>
							<p className='text-sm font-medium leading-none'>{name}</p>
							<p className='text-sm text-muted-foreground'>{description}</p>
						</div>
					</Link>
				))}
			</CardContent>
		</Card>
	)
}
