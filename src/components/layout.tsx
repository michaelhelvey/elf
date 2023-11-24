import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setColorTheme } from '@/components/ui/utils'
import { SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { MoonIcon } from '@radix-ui/react-icons'
import { Link } from '@remix-run/react'

export function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<header className='p-4 flex justify-between container'>
				<Link to='/'>
					<img
						src='/elf.png'
						alt='Elf logo'
						className='h-12 w-12 border border-muted rounded-full shadow-sm hover:scale-110 transition-transform ease-in-out duration-150'
					/>
				</Link>
				<div className='flex items-center gap-6'>
					<AppearanceToggle />
					<SignedIn>
						<div className='w-8 h-8'>
							<UserButton />
						</div>
					</SignedIn>
					<SignedOut>
						<Button asChild variant={'link'}>
							<Link to='/login'>Log In</Link>
						</Button>
					</SignedOut>
				</div>
			</header>
			<main className='flex flex-col flex-1'>{children}</main>
			<footer className='p-4 container text-muted-foreground/50 text-xs'>
				Copyright &copy; Michael Helvey {new Date().getFullYear()}
			</footer>
		</>
	)
}

function AppearanceToggle() {
	const updateTheme = (theme: 'dark' | 'light') => () => {
		setColorTheme(theme)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='hover:bg-accent p-3 rounded'>
				<MoonIcon height={16} width={16} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onSelect={updateTheme('light')}>Light</DropdownMenuItem>
				<DropdownMenuItem onSelect={updateTheme('dark')}>Dark</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
