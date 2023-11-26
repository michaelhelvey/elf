import { SignedOut } from '@clerk/remix'
import { Link } from '@remix-run/react'
import { Button } from '../../components/ui/button'

export function LandingPage() {
	return (
		<SignedOut>
			<section className='flex-1 flex flex-col items-center justify-center py-8 px-6'>
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
