import { getListsForUser, getListsSharedWithUser } from '@/lib/crud.server'
import { LandingPage } from '@/routes/home/landing-page'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { DashboardPage } from './dashboard'

export const loader = async (args: LoaderFunctionArgs) => {
	const { userId } = await getAuth(args)

	if (!userId) {
		return {
			type: 'unauthorized',
		} as const
	}

	const myLists = await getListsForUser(userId)
	const sharedLists = await getListsSharedWithUser(userId)

	return {
		type: 'authorized',
		myLists: myLists,
		sharedLists: sharedLists,
	} as const
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>()

	if (loaderData.type === 'unauthorized') {
		return <LandingPage />
	}

	return <DashboardPage myLists={loaderData.myLists} sharedLists={loaderData.sharedLists} />
}
