import { createList } from '@/lib/crud.server'
import { logger } from '@/lib/logger.server'
import { dataFunctionAuthGuard } from '@/lib/utils'
import { listFieldsValidator } from '@/routes/home/components/list-form'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

/**
 * /lists/create API endpoint
 */
export const action = async (args: ActionFunctionArgs) => {
	const userId = await dataFunctionAuthGuard(args)
	const rawFormData = await args.request.formData()

	switch (args.request.method) {
		case 'POST': {
			const result = await listFieldsValidator.validate(rawFormData)

			if (result.error) {
				logger.error({ msg: 'invalid form data', data: result })
				return validationError(result.error)
			}

			const { newListId } = await createList({ owner_id: userId, ...result.data })
			logger.info({ msg: 'successfully created list', data: result.data })

			return redirect(`/lists/${newListId}`)
		}
		default:
			throw new Response('Method Not Allowed', { status: 405 })
	}
}
