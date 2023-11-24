import { handleNewListCreateOrUpdate } from '@/components/list-form'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { ActionFunctionArgs } from '@remix-run/node'

export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)
	const rawFormData = await args.request.formData()

	switch (args.request.method) {
		case 'POST': {
			return await handleNewListCreateOrUpdate(userId, undefined, rawFormData)
		}
	}
}
