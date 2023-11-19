import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import { AppLayout } from './components/layout'
import stylesheet from './globals.css'
import { ssrReadColorTheme } from './lib/utils'

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: stylesheet,
	},
]

export const meta: MetaFunction = () => [
	{
		title: 'Remix Goblincore Stack',
	},
	{
		name: 'viewport',
		content: 'width=device-width, initial-scale=1.0',
	},
	{
		charset: 'utf-8',
	},
]

export const loader: LoaderFunction = args => {
	return rootAuthLoader(
		args,
		({ request }) => {
			const cookieHeader = request.headers.get('Cookie')
			const theme = ssrReadColorTheme(cookieHeader)
			return {
				theme,
			}
		},
		{ loadUser: true }
	)
}

export const ErrorBoundary = ClerkErrorBoundary()

function App() {
	// Sadly, this cast seems to be required because @clerk/remix doesn't pass the underlying loader
	// return type through, relying instead on the more generic (and useless) `LoaderFunctionReturn`
	// type from remix, which is basically just Record<string, unknown>
	const { theme } = useLoaderData<{ theme: string | undefined }>()

	return (
		<html lang='en'>
			<head>
				<Meta />
				<Links />
			</head>
			<body className={clsx('flex flex-col', { dark: theme === 'dark' })}>
				<AppLayout>
					<Outlet />
				</AppLayout>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export default ClerkApp(App, {
	signInUrl: '/login',
	signUpUrl: '/signup',
	afterSignInUrl: '/',
	afterSignUpUrl: '/',
	appearance: {
		elements: {
			breadcrumbsItem: 'text-foreground',
			active: 'bg-muted',
			formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
			avatarBox: 'animate-fade-in animate-pop',
			avatarImageActionsUpload: 'text-muted-foreground hover:text-muted-foreground/90',
			avatarImageActionsRemove: 'text-muted-foreground hover:text-muted-foreground/90',
			fileDropAreaFooterHint: 'text-muted-foreground',
			fileDropAreaBox: 'border border-input rounded-md bg-muted text-muted-foreground',
			fileDropAreaIconBox: 'text-muted-foreground bg-primary/10',
			fileDropAreaButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
			userPreviewMainIdentifier: 'text-foreground',
			userPreviewSecondaryIdentifier: 'text-muted-foreground',
			userButtonPopoverActionButtonIcon: 'text-muted-foreground',
			userButtonPopoverActionButtonText: 'text-foreground',
			userButtonPopoverFooter: 'hidden',
			profileSectionTitle: 'border-b border-muted',
			profileSectionTitleText: 'text-foreground',
			profileSectionPrimaryButton: 'text-foreground hover:bg-muted',
			profileSectionContent: 'text-foreground',
			form: 'text-foreground mb-4',
			navbar: 'border-r border-muted',
			navbarButton: 'text-foreground',
			accordionTriggerButton: 'text-foreground',
			headerTitle: 'text-foreground',
			headerSubtitle: 'text-muted-foreground',
			card: 'bg-background text-foreground border border-accent',
			formFieldLabel: 'text-accent-foreground',
			footerActionText: 'text-accent-foreground',
			footerActionLink: 'text-primary hover:text-primary/90',
			identityPreview: 'bg-accent text-accent-foreground',
			identityPreviewText: 'text-accent-foreground',
			identityPreviewEditButton: 'text-primary hover:text-primary/90',
			formButtonReset: 'text-accent-foreground hover:bg-muted',
			formFieldInput:
				'bg-background text-foreground placeholder:text-muted-foreground rounded border border-input accent-primary',
		},
	},
})
