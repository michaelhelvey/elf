import { MyLists } from '@/components/home-my-lists'
import { SharedLists } from '@/components/home-shared-lists'
import { LandingPage } from '@/components/landing-page'
import { handleDeleteListRequest } from '@/components/my-list-entry'
import { handleNewListCreateRequest } from '@/components/new-list-form'
import { getListsForUser, getListsSharedWithUser } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { SignedIn } from '@clerk/remix'
import { getAuth } from '@clerk/remix/ssr.server'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

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

const rootActionSchema = zfd.formData({
	action: zfd.text(z.enum(['delete_list', 'create_list'])),
})

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const rawFormData = await args.request.formData()
	const form = rootActionSchema.safeParse(rawFormData)

	if (!form.success) {
		logger.error({ msg: 'invalid form data', data: form, error: form.error })
		throw new Response('invalid form data', { status: 400 })
	}

	switch (form.data.action) {
		case 'delete_list': {
			return await handleDeleteListRequest(userId, rawFormData)
		}
		case 'create_list': {
			return await handleNewListCreateRequest(userId, rawFormData)
		}
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
