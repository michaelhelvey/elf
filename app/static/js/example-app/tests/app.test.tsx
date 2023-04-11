import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { App } from '../app'

describe('App', () => {
	test('it renders a counter', async () => {
		const user = userEvent.setup()
		render(<App />)

		expect(screen.getByText(/count:.*0/i)).toBeInTheDocument()
		await user.click(screen.getByRole('button'))
		expect(screen.getByText(/count:.*1/i)).toBeInTheDocument()
	})
})
