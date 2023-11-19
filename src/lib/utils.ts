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
