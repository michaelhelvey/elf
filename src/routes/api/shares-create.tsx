import { createShareToken, getListById } from '@/lib/crud.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { ActionFunctionArgs } from '@remix-run/node'

/**
 * /lists/:listId/shares/create API endpoint
 */
export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)

	const listId = parseInt(args.params.listId as string)
	const list = await getListById(listId)

	if (list.owner.id !== userId) {
		return new Response('Forbidden', { status: 403 })
	}

	const { newToken } = await createShareToken(listId)
	const shareURL = new URL(`/lists/${listId}/shares/activate?token=${newToken}`, args.request.url)

	return { shareURL }
}
