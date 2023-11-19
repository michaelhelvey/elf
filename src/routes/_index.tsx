import { Button } from '@/components/ui/button'

import { SignedIn, SignedOut, useUser } from '@clerk/remix'
import { Link } from '@remix-run/react'

export default function Index() {
	const { user } = useUser()

	return (
		<div className='container p-6'>
			<SignedIn>
				<h1 className='font-bold text-2xl leading-relaxed my-2'>
					Welcome, {user?.username}!
				</h1>
				<p>You are signed in to the website.</p>
			</SignedIn>
			<SignedOut>
				<h1 className='font-bold text-2xl leading-relaxed my-2'>Sup, Pleb?</h1>
				<div>
					You are currently signed out. If you want to make your experience substantially
					more rad, sign in or create an account:
				</div>
				<Button asChild className='my-2'>
					<Link to='/login'>Log In</Link>
				</Button>
			</SignedOut>
		</div>
	)
}
