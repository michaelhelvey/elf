import { AuthLayout } from '@/components/auth-layout'
import { SignUp } from '@clerk/remix'
import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader = ({ request }: LoaderFunctionArgs) => {
	const redirectUrl = new URL(request.url).searchParams.get('redirect_url')

	if (redirectUrl) {
		return {
			redirectUrl,
		}
	}

	return {
		redirectUrl: '/',
	}
}

export default function SignUpPage() {
	const { redirectUrl } = useLoaderData<typeof loader>()
	return (
		<AuthLayout>
			<SignUp redirectUrl={redirectUrl} />
		</AuthLayout>
	)
}
