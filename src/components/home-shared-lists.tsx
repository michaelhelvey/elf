import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SharedList } from '@/lib/crud.server'
import { Share1Icon } from '@radix-ui/react-icons'
import { Link } from '@remix-run/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'

interface SharedListsProps {
	lists: SharedList[]
}

export function SharedLists({ lists }: SharedListsProps) {
	const ownerInitials = (owner: SharedList['owner']) => {
		const firstInitial = owner.first_name?.[0] ?? ''
		const lastInitial = owner.last_name?.[0] ?? ''
		return firstInitial + lastInitial
	}
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
