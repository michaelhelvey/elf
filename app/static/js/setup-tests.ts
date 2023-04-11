import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import matchers from '@testing-library/jest-dom/matchers'

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Vi {
		interface JestAssertion<T = any>
			extends jest.Matchers<void, T>,
				TestingLibraryMatchers<T, void> {}
	}
}

expect.extend(matchers)
