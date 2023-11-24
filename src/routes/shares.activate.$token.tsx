import { ShareTokenResult, validateAndAssociateShareToken } from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ok } from 'assert'

export const loader = async (args: LoaderFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)
	const token = args.params.token
	ok(token, 'expected token route param')

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
	return (
		<div className='flex flex-col p-6 container'>
			<h1 className='text-2xl font-bold'>Error Code: {result}</h1>
		</div>
	)
}
