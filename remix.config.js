/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ['**/.*'],
	serverModuleFormat: 'esm',
	appDirectory: 'src',
	assetsBuildDirectory: 'public/build',
	publicPath: '/build/',
	serverBuildPath: 'build/index.js',
	routes(defineRoutes) {
		return defineRoutes(route => {
			route('/', 'routes/home/home.tsx')
			route('/lists/create', 'routes/api/lists-create.tsx')
			route('/lists/:listId', 'routes/list-detail/list-detail.tsx')
			route('/lists/:listId/items/create', 'routes/api/list-items-create.tsx')
			route(
				'/lists/:listId/items/:listItemId/toggle-purchased',
				'routes/api/list-items-purchase.tsx'
			)
			route('/lists/:listId/items/:listItemId', 'routes/api/list-items.tsx')
			route('/lists/:listId/shares/create', 'routes/api/shares-create.tsx')
			route('/lists/:listId/shares/activate', 'routes/shares/activate.tsx')
			route('/api/clerk', 'routes/api/clerk.tsx')
		})
	},
}
