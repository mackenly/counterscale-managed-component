import {
	ComponentSettings,
	Manager as OriginalManager,
} from '@managed-components/types';
import { RequestInit, Response } from '@cloudflare/workers-types';

interface Manager extends OriginalManager {
	ext: {
		env: {
			counterscale_worker: {
				fetch: (url: string, init?: RequestInit) => Promise<Response>;
			};
		};
	};
}

interface Params {
	sid: string; // site id
	h: string; // host
	p: string; // pathname
	r: string; // referer
}

export default async function (manager: Manager, settings: ComponentSettings) {
	manager.addEventListener('pageview', async event => {
		const { client } = event;

		// last time seen for session and new visitor calculation
		const lastTimeSeen: string = client.get('if_modified_since') || '';
		const currentTime = new Date().toUTCString();
		client.set('if_modified_since', currentTime.toString(), {
			scope: 'infinite',
		});

		const paramData: Params = {
			sid: settings.siteId || client.url.hostname,
			h: client.url.host,
			p: client.url.pathname,
			r: client.referer, // notice the different spelling
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const params = new URLSearchParams(paramData as any);

		// make sure apiBaseUrl ends with a slash
		let apiUrl = settings.apiBaseUrl;
		if (!apiUrl.endsWith('/')) {
			apiUrl += '/';
		}
		apiUrl += `collect?${params.toString()}`;

		await manager?.ext?.env.counterscale_worker
			.fetch(`${apiUrl}`, {
				method: 'POST',
				headers: {
					'user-agent': client.userAgent,
					'if-modified-since': lastTimeSeen,
				},
				cf: {
					country: event.payload.country,
				},
			} as RequestInit) // Add type assertion to include 'cf' property
			.then(res => res.text())
			.then(text => {
				console.log('text', text);
			})
			.catch(err => {
				console.log('err', err);
			});
	});
}
