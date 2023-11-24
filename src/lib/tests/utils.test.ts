import { ssrReadColorTheme } from '../utils'

describe('ssrReadColorTheme', () => {
	it('returns undefined if cookieHeader is null', () => {
		expect(ssrReadColorTheme(null)).toBeUndefined()
	})

	it('returns undefined if theme= not found', () => {
		const cookieHeader = 'foo=bar; other=value'
		expect(ssrReadColorTheme(cookieHeader)).toBeUndefined()
	})

	it('returns theme if found before semicolon', () => {
		const cookieHeader = 'theme=light; other=value'
		expect(ssrReadColorTheme(cookieHeader)).toBe('light')
	})

	it('returns theme if at end of string', () => {
		const cookieHeader = 'theme=dark'
		expect(ssrReadColorTheme(cookieHeader)).toBe('dark')
	})
})
