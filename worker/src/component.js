async function l(i, a, r) {
	a.addEventListener('pageview', async s => {
		let { client: e } = s,
			o = e.get('if_modified_since') || new Date().toUTCString(),
			c = new Date().toUTCString()
		e.set('if_modified_since', c.toString(), { scope: 'infinite' })
		let m = {
				sid: r.siteId || e.url.hostname,
				h: e.url.host,
				p: e.url.pathname,
				r: e.referer,
			},
			g = new URLSearchParams(m),
			n = r.apiBaseUrl
		n.endsWith('/') || (n += '/'),
			(n += `collect?${g.toString()}`),
			await i.counterscale_worker
				.fetch(`${n}`, {
					method: 'POST',
					headers: { 'user-agent': e.userAgent, 'if-modified-since': o },
				})
				.then(t => t.text())
				.then(t => {
					console.log('text', t)
				})
				.catch(t => {
					console.log('err', t)
				})
	})
}
export { l as default }
