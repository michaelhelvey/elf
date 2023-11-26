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
import { DotFilledIcon, PersonIcon, RowsIcon, Share1Icon } from '@radix-ui/react-icons'
import { SerializeFrom } from '@remix-run/node'
import { Link } from '@remix-run/react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow/index.js'
import { ListForm } from './components/list-form'
import { OwnedListDisplay } from './components/owned-list-display'

interface DashboardPageProps {
	myLists: SerializeFrom<OwnedList>[]
	sharedLists: SerializeFrom<SharedList>[]
}

export function DashboardPage({ myLists, sharedLists }: DashboardPageProps) {
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
		<Card className='w-full max-w-lg'>
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
	lists: SerializeFrom<SharedList>[]
}

export function SharedLists({ lists }: SharedListsProps) {
	return (
		<Card className='w-full max-w-lg'>
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
				{lists.map(({ name, description, id, owner, updated_at }) => (
					<Link
						className='rounded-md transition-all hover:bg-accent hover:text-accent-foreground mb-4 last:mb-0 p-2 block'
						key={id}
						to={`/lists/${id}`}
					>
						<div className='flex items-center gap-2'>
							<Avatar className='w-8 h-8'>
								<AvatarImage src={owner.avatar_url ?? undefined} alt={owner.name} />
								<AvatarFallback>
									<PersonIcon className='w-full h-full p-1 bg-stone-500 text-white' />
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='text-foreground font-semibold'>{name}</p>
								<div className='flex items-center flex-wrap'>
									<span className='text-xs text-muted-foreground'>
										shared by{' '}
										<span className='text-foreground font-semibold'>
											{owner.name}
										</span>
									</span>
									<DotFilledIcon className='text-muted-foreground w-2 h-2 mx-1'></DotFilledIcon>
									<span className='text-xs text-muted-foreground'>
										updated {formatDistanceToNow(new Date(updated_at))} ago
									</span>
								</div>
							</div>
						</div>
						<p className='mt-2 text-sm'>{description}</p>
					</Link>
				))}
			</CardContent>
		</Card>
	)
}
