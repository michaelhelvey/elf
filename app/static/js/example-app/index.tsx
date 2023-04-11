import { render } from 'preact'
import invariant from 'tiny-invariant'
import { App } from './app'

// On intial page load, render the app
const appElement = document.getElementById('app')
invariant(appElement, 'Could not find element with id #app')

render(<App />, appElement)
