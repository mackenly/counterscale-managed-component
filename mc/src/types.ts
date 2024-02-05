import { KVNamespace } from '@cloudflare/workers-types'

export interface Params {
	sid: string // site id
	h: string // host
	p: string // pathname
	r: string // referer
}

export type Env = {
	KV: KVNamespace
	counterscale_worker: {
		fetch: (url: string, init?: RequestInit) => Promise<Response>
	}
}
