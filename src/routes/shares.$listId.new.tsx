import { createShareToken, getListById } from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { ActionFunctionArgs } from '@remix-run/node'

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = parseInt(args.params.listId as string)
	const list = await getListById(listId)

	if (list.owner_id !== userId) {
		return new Response('Forbidden', { status: 403 })
	}

	const { newToken } = await createShareToken(listId)
	const shareURL = new URL(`/shares/activate/${newToken}`, args.request.url)

	return { shareURL }
}
