import { AuthLayout } from '@/components/auth-layout'
import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
	return (
		<AuthLayout>
			<SignUp />
		</AuthLayout>
	)
}
