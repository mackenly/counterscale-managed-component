async function l(r, a) {
	r.addEventListener('pageview', async i => {
		let { client: e } = i,
			s = e.get('if_modified_since') || '',
			o = new Date().toUTCString();
		e.set('if_modified_since', o.toString(), { scope: 'infinite' });
		let c = {
				sid: a.siteId || e.url.hostname,
				h: e.url.host,
				p: e.url.pathname,
				r: e.referer,
			},
			g = new URLSearchParams(c),
			n = a.apiBaseUrl;
		n.endsWith('/') || (n += '/'),
			(n += `collect?${g.toString()}`),
			await r?.ext?.env.counterscale_worker
				.fetch(`${n}`, {
					method: 'POST',
					headers: { 'user-agent': e.userAgent, 'if-modified-since': s },
					cf: { country: i.payload.country },
				})
				.then(t => t.text())
				.then(t => {
					console.log('text', t);
				})
				.catch(t => {
					console.log('err', t);
				});
	});
}
export { l as default };
