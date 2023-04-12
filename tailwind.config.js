/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/templates/**/*.html', './app/static/js/**/*.tsx'],
	theme: {
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
		},
		extend: {
			animation: {
				'fade-in': 'fade-in 0.3s ease-in-out',
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
