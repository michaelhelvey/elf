import { db } from '@/lib/db.server'
import { logger } from '@/lib/logger.server'
import { users } from '@/lib/schema.server'
import { ActionFunction } from '@remix-run/node'
import { eq } from 'drizzle-orm'
import { ok as invariant } from 'node:assert'
import { Webhook } from 'svix'
import { z } from 'zod'

export const action: ActionFunction = async ({ request }) => {
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

	if (!WEBHOOK_SECRET) {
		throw new Error(
			'Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to evironment'
		)
	}

	// Get the headers
	const svix_id = request.headers.get('svix-id')
	const svix_timestamp = request.headers.get('svix-timestamp')
	const svix_signature = request.headers.get('svix-signature')

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response('Error occured -- no svix headers', {
			status: 400,
		})
	}

	// Get the body
	const rawPayload = (await request.json()) as Record<string, unknown>

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET)

	// Verify the payload with the headers
	try {
		wh.verify(JSON.stringify(rawPayload), {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		})
	} catch (error) {
		logger.error({ msg: 'error verifying webhook', error })
		return new Response('could not verify webhook', {
			status: 400,
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const payload = webhookSchema.safeParse(rawPayload)

	if (!payload.success) {
		logger.error({ msg: 'error parsing webhook payload', payload, error: payload.error })
		return new Response('could not parse webhook payload', {
			status: 400,
		})
	}

	await handlePayload(payload.data)

	return new Response('OK', { status: 200 })
}

export const webhookSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('user.created'),
		data: z.object({
			id: z.string(),
			first_name: z.string(),
			last_name: z.string(),
			primary_email_address_id: z.string(),
			created_at: z.number(),
			profile_image_url: z.string().optional(),
			email_addresses: z
				.object({
					email_address: z.string(),
					id: z.string(),
				})
				.array(),
		}),
	}),
	z.object({
		type: z.literal('user.updated'),
		data: z.object({
			id: z.string(),
			first_name: z.string(),
			last_name: z.string(),
			primary_email_address_id: z.string(),
			created_at: z.number(),
			profile_image_url: z.string().optional(),
			email_addresses: z
				.object({
					email_address: z.string(),
					id: z.string(),
				})
				.array(),
		}),
	}),
	z.object({
		type: z.literal('user.deleted'),
		data: z.object({
			id: z.string(),
		}),
	}),
])

async function handlePayload(payload: z.infer<typeof webhookSchema>) {
	switch (payload.type) {
		case 'user.created': {
			type NewUser = typeof users.$inferInsert
			const primaryEmailAddr = payload.data.email_addresses.find(
				addr => addr.id === payload.data.primary_email_address_id
			)
			invariant(primaryEmailAddr, 'no primary email address found')
			const newUser: NewUser = {
				id: payload.data.id,
				first_name: payload.data.first_name,
				last_name: payload.data.last_name,
				email: primaryEmailAddr?.email_address,
				avatar_url: payload.data.profile_image_url,
				created_at: new Date(),
				updated_at: new Date(),
			}

			await db.insert(users).values(newUser)
			break
		}
		case 'user.updated': {
			const updatedUser = {
				first_name: payload.data.first_name,
				last_name: payload.data.last_name,
				email: payload.data.email_addresses[0].email_address,
				avatar_url: payload.data.profile_image_url,
				updated_at: new Date(),
			}

			await db.update(users).set(updatedUser).where(eq(users.id, payload.data.id))
			break
		}
		case 'user.deleted': {
			await db.delete(users).where(eq(users.id, payload.data.id))
			break
		}
	}
}
