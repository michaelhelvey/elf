import { validateAndAssociateShareToken } from '@/lib/crud.server'
import { ShareTokenResult } from '@/lib/shared-types'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'

export const loader = async (args: LoaderFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)
	const token = new URL(args.request.url).searchParams.get('token')

	if (!token) {
		throw new Response('Missing token', { status: 400 })
	}

	const { result, listId } = await validateAndAssociateShareToken(userId, token)

	if (result === ShareTokenResult.SUCCESS) {
		return redirect(`/lists/${listId}`)
	}

	return {
		result,
	}
}

export default function ShareActivatePage() {
	const { result } = useLoaderData<typeof loader>()

	// This is pretty silly, but if a user goes to sign up via a share link it will take a second to
	// create their account via Clerk so we just wait and then reload the page.  Super hacky obviously
	// but it's a quick fix for now.
	useEffect(() => {
		let timeout: NodeJS.Timeout

		if (result === ShareTokenResult.USER_NOT_FOUND) {
			timeout = setTimeout(() => {
				window.location.reload()
			}, 1000)
		}

		return () => clearTimeout(timeout)
	}, [result])

	return (
		<div className='flex flex-col p-6 container'>
			<h1 className='text-2xl font-bold'>Error Code: {result}</h1>
		</div>
	)
}
