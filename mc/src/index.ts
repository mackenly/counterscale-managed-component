import { ComponentSettings, Manager } from '@managed-components/types'
import { KVNamespace } from '@cloudflare/workers-types'

interface Params {
	sid: string // site id
	h: string // host
	p: string // pathname
	r: string // referer
}

type Env = {
	KV: KVNamespace
	counterscale_worker: {
		fetch: (url: string, init?: RequestInit) => Promise<Response>
	}
}

export default async function (
	env: Env,
	manager: Manager,
	settings: ComponentSettings
) {
	manager.addEventListener('pageview', async event => {
		const { client } = event

		// last time seen for session and new visitor calculation
		const lastTimeSeen: string =
			client.get('if_modified_since') || new Date().toUTCString()
		const currentTime = new Date().toUTCString()
		client.set('if_modified_since', currentTime.toString(), {
			scope: 'infinite',
		})

		const paramData: Params = {
			sid: settings.siteId || client.url.hostname,
			h: client.url.host,
			p: client.url.pathname,
			r: client.referer, // notice the different spelling
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const params = new URLSearchParams(paramData as any)

		// make sure apiBaseUrl ends with a slash
		let apiUrl = settings.apiBaseUrl
		if (!apiUrl.endsWith('/')) {
			apiUrl += '/'
		}
		apiUrl += `collect?${params.toString()}`

		await env.counterscale_worker
			.fetch(`${apiUrl}`, {
				method: 'POST',
				headers: {
					'user-agent': client.userAgent,
					'if-modified-since': lastTimeSeen,
				},
			})
			.then(res => res.text())
			.then(test => {
				console.log('text', test)
			})
			.catch(err => {
				console.log('err', err)
			})
	})
}
