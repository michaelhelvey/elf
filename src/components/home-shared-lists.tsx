import { SharedList } from '@/lib/crud.server'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { Share1Icon } from '@radix-ui/react-icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface SharedListsProps {
	lists: SharedList[]
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
				{lists.map(({ name, description, id }) => (
					<div
						className='flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground my-1'
						key={id}
					>
						<Avatar>
							<AvatarImage src='https://avatars.githubusercontent.com/u/12801974?v=4'></AvatarImage>
							<AvatarFallback>MH</AvatarFallback>
						</Avatar>
						<div className='space-y-1'>
							<p className='text-sm font-medium leading-none'>{name}</p>
							<p className='text-sm text-muted-foreground'>{description}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	)
}
