import { getListsForUser, getListsSharedWithUser } from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { LandingPage } from '@/routes/home/landing-page'
import { LoaderFunctionArgs } from '@remix-run/node'
import { DashboardPage } from './dashboard'

export const loader = async (args: LoaderFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

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
