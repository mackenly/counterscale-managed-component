# Counterscale Managed Component
[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 📖 Documentation
If using Cloudflare Zaraz: [Custom MC docs](https://developers.cloudflare.com/zaraz/advanced/load-custom-managed-component/#docs-content)

> [!IMPORTANT]  
> If running Counterscale on the same zone as the site running Zaraz, you will get 522 HTTP errors because of a security limitation that prevents Cloudflare Workers from making requests to the same zone. To fix this, you will need to run Counterscale on a different zone than the site running Zaraz. [Question on Cloudflare Discord](https://discord.com/channels/595317990191398933/1200687018477359124/1200689850202992681)


 

## ⚙️ Tool Settings

> Settings are used to configure the tool in a Component Manager config file

### Site ID `string` _required_

`siteId` can be practically any string. It is used to identify the site in the Counterscale system. You can find it in the Counterscale dashboard.

### API Base URL `string` _required_

`apiBaseUrl` is the base URL of the Counterscale API. If you have Counterscale on its own domain it may look like `https://stats.example.com/`. If you have Counterscale on a route of your own domain it may look like `https://example.com/api/counterscale/`. Either way, the URL should point to the Counterscale API with the `collect` endpoint.

<!--## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Human Readable Field Name `type` _required_

`field_id` give it a short description and send to a more detailed reference [Find more about how to create your own Managed Component](https://managedcomponents.dev/).-->

## 📝 License

Licensed under the [Apache License](./LICENSE).
