import { logger } from '@/lib/logger.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import got from 'got'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')

	try {
		const url = new URL('/', `http://${host}`)

		await got.head(url.toString())
		logger.info({ msg: 'checked self-connectivity' })

		return new Response('OK')
	} catch (error: unknown) {
		logger.error({ msg: 'Healthcheck failed', error })

		return new Response('ERROR', { status: 500 })
	}
}
