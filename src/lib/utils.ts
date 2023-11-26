import { getAuth } from '@clerk/remix/ssr.server'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { clsx, type ClassValue } from 'clsx'
import Cookie from 'js-cookie'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function setColorTheme(theme: 'dark' | 'light') {
	document.body.classList.remove('dark', 'light')
	document.body.classList.add(theme)

	Cookie.set('theme', theme)
}

/**
 * Reads color theme from cookie header. If no theme is found, returns undefined.  I'm sure there's
 * some library that does this, but I'm trying to get something done right now, and parsing all
 * cookies just to read one seems stupid.
 */
export function ssrReadColorTheme(cookieHeader: string | null) {
	if (!cookieHeader) return
	const idx = cookieHeader.indexOf('theme=')
	if (idx === -1) return

	for (let i = idx; i < cookieHeader.length; i++) {
		if (cookieHeader[i] === ';') {
			return cookieHeader.slice(idx + 6, i)
		} else if (i === cookieHeader.length - 1) {
			return cookieHeader.slice(idx + 6)
		}
	}
}

export async function dataFunctionAuthGuard(args: ActionFunctionArgs) {
	const { userId } = await getAuth(args)
	if (!userId) {
		throw redirect('/login?redirect_url=' + encodeURIComponent(args.request.url))
	}

	return userId
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface UserWithInitials {
	first_name?: string | null
	last_name?: string | null
}

export function initials({ first_name, last_name }: UserWithInitials) {
	const first = first_name?.trim()?.[0] || ''
	const last = last_name?.trim()?.[0] || ''
	return first + last
}
