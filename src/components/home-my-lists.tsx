import { MyList } from '@/lib/crud.server'
import { RowsIcon } from '@radix-ui/react-icons'
import { NewListForm } from './list-form'
import { MyListEntry } from './my-list-entry'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'

interface MyListsProps {
	lists: MyList[]
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
					<MyListEntry list={list} key={list.id} />
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
						<NewListForm />
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	)
}
