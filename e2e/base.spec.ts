import { db } from '@/lib/db.server'
import { shareTokens } from '@/lib/schema.server'
import { expect, test } from '@playwright/test'
import { desc } from 'drizzle-orm'

test('can log in, create lists, and copy a share link to that list', async ({ page }) => {
	// Log in as User 1:
	await page.goto('/')
	await page.getByRole('link', { name: 'Get Started' }).click()
	await page.getByLabel('Email address').fill('michael.helvey1+elf1@gmail.com')
	await page.getByLabel('Email address').press('Enter')
	await page
		.getByLabel('Password', { exact: true })
		.fill(process.env.TEST_USER_PASSWORD as string)
	await page.getByLabel('Password', { exact: true }).press('Enter')

	// Then we should be able to create a new list:
	await page.getByRole('button', { name: 'Create a new list' }).click()
	await page.getByPlaceholder('Name').fill('Christmas 2024')
	await page.getByPlaceholder('Description').click()
	await page.getByPlaceholder('Description').fill('My favorite stuff ever')
	await page.getByPlaceholder('Description').press('Tab')
	await page.getByRole('button', { name: 'Create' }).press('Enter')

	// then we should taken directly to the new list page:
	await page.getByRole('button', { name: 'New Item' }).click()
	await page.getByPlaceholder('Name').fill('Item 1')
	await page.getByPlaceholder('Name').press('Tab')
	await page.getByPlaceholder('Link').fill('https://example.com/item1')
	await page.getByPlaceholder('Link').press('Tab')
	await page.getByPlaceholder('Description').fill('My first list item')
	await page.getByRole('button', { name: 'Create' }).click()

	// Now we should be able to copy a share link to that list:
	await page.getByRole('button', { name: 'Share Link' }).click()
	const linkTokens = await db
		.select()
		.from(shareTokens)
		.orderBy(desc(shareTokens.created_at))
		.limit(1)
	const linkToken = linkTokens[0]
	const link = `http://localhost:3000/lists/${linkToken.list_id}/shares/activate?token=${linkToken.token}`

	await page.getByLabel('Open user button').click()
	await page.getByRole('menuitem', { name: 'Sign out' }).click()

	await page.goto(link)

	await page.getByLabel('Email address').fill('michael.helvey1+elf2@gmail.com')
	await page.getByLabel('Email address').press('Enter')
	await page
		.getByLabel('Password', { exact: true })
		.fill(process.env.TEST_USER_PASSWORD as string)
	await page.getByLabel('Password', { exact: true }).press('Enter')

	await expect(page.getByRole('heading', { name: 'Christmas 2024' })).toBeVisible()
	await expect(page.getByText('Item 1')).toBeVisible()
	await page.getByTitle('Mark as purchased').click()
	await expect(page.getByText('Purchased by you')).toBeVisible()
})
