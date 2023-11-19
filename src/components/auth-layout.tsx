export function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='container flex flex-col flex-1 items-center justify-center p-6'>
			{children}
		</div>
	)
}
