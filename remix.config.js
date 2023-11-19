/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ['**/.*'],
	serverModuleFormat: 'esm',
	appDirectory: 'src',
	assetsBuildDirectory: 'public/build',
	publicPath: '/build/',
	serverBuildPath: 'build/index.js',
}
