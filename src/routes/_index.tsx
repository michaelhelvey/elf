import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, useUser } from '@clerk/remix'
import { Link } from '@remix-run/react'

export default function Index() {
	const { user } = useUser()

	return (
		<>
			<SignedIn>
				<h1 className='font-bold text-2xl leading-relaxed my-2'>
					Welcome, {user?.username}!
				</h1>
				<p>You are signed in to the website.</p>
			</SignedIn>
			<LandingPage />
		</>
	)
}

function LandingPage() {
	return (
		<SignedOut>
			<section className='flex-1 flex flex-col items-center justify-center py-8'>
				<h1 className='font-black text-9xl my-6'>Elf</h1>
				<div className='text-4xl text-center my-4 max-w-2xl'>
					Elf is the easiest way to share gift ideas with your friends and family.
				</div>
				<Button size='lg' className='my-4' asChild>
					<Link to='/login'>Get Started</Link>
				</Button>
			</section>
		</SignedOut>
	)
}
