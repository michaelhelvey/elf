import { AuthLayout } from '@/components/auth-layout'
import { SignIn } from '@clerk/remix'

export default function SignInPage() {
	return (
		<AuthLayout>
			<SignIn />
		</AuthLayout>
	)
}
