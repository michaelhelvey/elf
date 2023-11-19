import { render, screen } from '@testing-library/react'

const Example = () => {
	return <div>Hello from vitest!</div>
}

describe('testing', () => {
	it('can test using vitest happy-dom & react-testing-library', () => {
		render(<Example />)

		expect(screen.getByText('Hello from vitest!')).toBeInTheDocument()
	})
})
