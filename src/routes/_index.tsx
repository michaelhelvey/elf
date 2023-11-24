import { MyLists } from '@/components/home-my-lists'
import { SharedLists } from '@/components/home-shared-lists'
import { LandingPage } from '@/components/landing-page'
import { getListsForUser, getListsSharedWithUser } from '@/lib/crud.server'
import { SignedIn } from '@clerk/remix'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader = async (args: LoaderFunctionArgs) => {
	const { userId } = await getAuth(args)
	if (!userId) {
		return redirect('/signin')
	}

	const myLists = await getListsForUser(userId)
	const sharedLists = await getListsSharedWithUser(userId)

	return {
		myLists: myLists,
		sharedLists: sharedLists,
	}
}

export default function Index() {
	return (
		<>
			<DashboardPage />
			<LandingPage />
		</>
	)
}

function DashboardPage() {
	const { myLists, sharedLists } = useLoaderData<typeof loader>()

	return (
		<SignedIn>
			<section className='flex-1 flex flex-col items-center justify-center p-6 gap-4'>
				<MyLists lists={myLists} />
				<SharedLists lists={sharedLists} />
			</section>
		</SignedIn>
	)
}
