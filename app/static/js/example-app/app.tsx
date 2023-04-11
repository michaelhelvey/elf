import { useState } from 'preact/hooks'

export function App() {
	const [count, setCount] = useState(0)

	return (
		<div className="mt-5 flex flex-col p-5 border border-gray-300 rounded">
			<div className="font-bold text-2xl">My Preact App:</div>
			<p className="my-3">Count: {String(count)}</p>
			<button className="button" onClick={() => setCount(count + 1)}>
				Inc
			</button>
		</div>
	)
}
