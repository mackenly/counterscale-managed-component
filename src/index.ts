import { ComponentSettings, Manager } from '@managed-components/types'

interface Params {
  sid: string // site id
  h: string // host
  p: string // pathname
  r: string // referer
}

export default async function (manager: Manager, _settings: ComponentSettings) {
  manager.addEventListener('pageview', async event => {
    const { client } = event
    console.log('Hello server!')

    // last time seen for session and new visitor calculation
    const lastTimeSeen: string =
      client.get('if_modified_since') || Date.now().toString()
    const currentTime = Date.now()
    client.set('if_modified_since', currentTime.toString(), {
      scope: 'infinite',
    })

    // site id and api hostname
    const { siteId, hostname } = _settings

    const paramData: Params = {
      sid: siteId || client.url.hostname,
      h: client.url.host,
      p: client.url.pathname,
      r: client.referer, // notice the different spelling
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = new URLSearchParams(paramData as any)

    await manager.fetch(`${hostname}/collect?${params.toString()}`, {
      method: 'POST',
      headers: {
        'user-agent': client.userAgent,
        'if-modified-since': lastTimeSeen,
      },
    })

    event.client.execute("console.log('Hello browser')")
  })
}
