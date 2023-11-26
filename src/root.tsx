import { TooltipProvider } from '@/components/ui/tooltip'
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
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from '@remix-run/react'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { AppLayout } from './components/layout'
import { Toaster } from './components/ui/toaster'
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
		title: 'Elf',
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

const AppShell = ({
	children,
	theme,
	strip,
}: {
	children: React.ReactNode
	theme: string | undefined
	strip?: boolean
}) => {
	return (
		<html lang='en'>
			<head>
				<Meta />
				<Links />
			</head>
			<body className={clsx('flex flex-col', { dark: theme !== 'light' })}>
				<AppLayout strip={!!strip}>{children}</AppLayout>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
				<Toaster />
			</body>
		</html>
	)
}

const ErrorPageWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div className='flex p-6 container flex-col'>{children}</div>
}

export function DefaultErrorBoundary() {
	const error = useRouteError()
	const theme = Cookies.get('theme') ?? 'dark'

	if (isRouteErrorResponse(error)) {
		return (
			<AppShell theme={theme} strip>
				<ErrorPageWrapper>
					<h1 className='font-bold text-2xl mb-4'>
						{error.status} {error.statusText}
					</h1>
					<h2 className='mt-8 mb-4 text-xl font-semibold'>Error Data:</h2>
					<pre className='overflow-x-scroll'>{error.data}</pre>
				</ErrorPageWrapper>
			</AppShell>
		)
	} else if (error instanceof Error) {
		return (
			<AppShell theme={theme} strip>
				<ErrorPageWrapper>
					<h1 className='font-bold text-2xl mb-4'>Application Error</h1>
					<p className='font-mono'>{error.message}</p>
					<h2 className='mt-8 mb-4 text-xl font-semibold'>Stack Trace:</h2>
					<pre className='overflow-x-scroll'>{error.stack}</pre>
				</ErrorPageWrapper>
			</AppShell>
		)
	} else {
		return (
			<AppShell theme={theme} strip>
				<ErrorPageWrapper>
					<h1 className='font-bold text-xl'>Unknown Error</h1>
				</ErrorPageWrapper>
			</AppShell>
		)
	}
}

export const ErrorBoundary = ClerkErrorBoundary(DefaultErrorBoundary)

function App() {
	const { theme } = useLoaderData<{ theme: string | undefined }>()
	return (
		<TooltipProvider>
			<AppShell theme={theme}>
				<Outlet></Outlet>
			</AppShell>
		</TooltipProvider>
	)
}

export default ClerkApp(App, {
	signInUrl: '/login',
	signUpUrl: '/signup',
	// Note: the real implementation of these are in the loaders in the login.$ and signup.$ files, respectively.
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
			otpCodeFieldInput: 'text-foreground border-b border-muted-foreground',
			formResendCodeLink: 'text-muted-foreground hover:text-foreground',
			form: 'text-foreground mb-4',
			navbar: 'border-r border-muted',
			navbarButton: 'text-foreground',
			accordionTriggerButton: 'text-foreground',
			headerTitle: 'text-foreground',
			headerSubtitle: 'text-muted-foreground',
			card: 'bg-background text-foreground border border-accent',
			formFieldLabel: 'text-accent-foreground',
			formFieldAction: 'text-primary',
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
