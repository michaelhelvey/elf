// this is a massive hack, and I'm sure there's a better way to do this

import { Fetcher } from '@remix-run/react'
import { useEffect, useRef } from 'react'

export function useFormSuccess(fetcher: Fetcher, cb: () => void) {
	const prevState = useRef(fetcher.state)

	useEffect(() => {
		if (fetcher.state === 'loading' && prevState.current === 'submitting') {
			cb()
		}

		prevState.current = fetcher.state
	}, [cb, fetcher.state])
}
