// it would be sick if we could extract the og:image from a url someday
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function extractOgImageFromUrl(_url: string) {
	// const url = new URL(_url)
	// const contentAtUrl = await fetch(url).then(res => res.text())
	// logger.info({ msg: 'extracting image', url })
	// const ogImage = contentAtUrl.match(/<meta property="og:image" content="(.+?)"/)?.[1]
	// return ogImage
	return Promise.resolve(null)
}
