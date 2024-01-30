async function m(i, r) {
  i.addEventListener('pageview', async a => {
    let { client: e } = a,
      s = e.get('if_modified_since') || new Date().toUTCString(),
      o = new Date().toUTCString()
    e.set('if_modified_since', o.toString(), { scope: 'infinite' })
    let c = {
        sid: r.siteId || e.url.hostname,
        h: e.url.host,
        p: e.url.pathname,
        r: e.referer,
      },
      g = new URLSearchParams(c),
      n = r.apiBaseUrl
    n.endsWith('/') || (n += '/'),
      (n += `collect?${g.toString()}`),
      await i
        .fetch(`${n}`, {
          method: 'POST',
          headers: { 'user-agent': e.userAgent, 'if-modified-since': s },
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
export { m as default }
