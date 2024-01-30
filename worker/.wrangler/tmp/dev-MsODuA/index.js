// .wrangler/tmp/bundle-7lCSgx/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/component.js
async function m(i, r) {
  i.addEventListener("pageview", async (a) => {
    let { client: e } = a, s = e.get("if_modified_since") || (/* @__PURE__ */ new Date()).toUTCString(), o = (/* @__PURE__ */ new Date()).toUTCString();
    e.set("if_modified_since", o.toString(), { scope: "infinite" });
    let c = {
      sid: r.siteId || e.url.hostname,
      h: e.url.host,
      p: e.url.pathname,
      r: e.referer
    }, g = new URLSearchParams(c), n = r.apiBaseUrl;
    n.endsWith("/") || (n += "/"), n += `collect?${g.toString()}`, await i.fetch(`${n}`, {
      method: "POST",
      headers: { "user-agent": e.userAgent, "if-modified-since": s }
    }).then((t) => t.text()).then((t) => {
      console.log("text", t);
    }).catch((t) => {
      console.log("err", t);
    });
  });
}

// src/utils.ts
var hasPermission = (component, permission, permissions) => {
  if (!permissions.includes(permission)) {
    console.error(
      `\u{1F6A8} ${component}: ${permission?.toLocaleUpperCase()} - Permission not granted `
    );
    return false;
  }
  return true;
};

// src/client.ts
var Client = class {
  #permissions;
  #component;
  #componentPath;
  emitter;
  screenWidth;
  screenHeight;
  viewportHeight;
  viewportWidth;
  userAgent;
  timezoneOffset;
  language;
  referer;
  ip;
  title;
  timestamp;
  url;
  #baseDomain;
  #cookies;
  #pendingCookies;
  #clientPrefs;
  #response;
  constructor(clientData, context) {
    this.#permissions = context.permissions;
    this.#component = context.component;
    this.#componentPath = context.componentPath;
    this.url = new URL(clientData.url);
    this.#response = context.response;
    this.title = clientData.title;
    this.timestamp = clientData.timestamp;
    this.userAgent = clientData.userAgent;
    this.language = clientData.language;
    this.referer = clientData.referer;
    this.ip = clientData.ip;
    this.timezoneOffset = parseInt(clientData.timezoneOffset);
    this.emitter = clientData.emitter;
    this.#baseDomain = clientData.baseDomain;
    this.screenWidth = clientData.screenWidth;
    this.screenHeight = clientData.screenHeight;
    this.viewportWidth = clientData.viewportWidth;
    this.viewportHeight = clientData.viewportHeight;
    this.#cookies = context.cookies;
    this.#pendingCookies = context.response.pendingCookies;
    this.#clientPrefs = context.response.clientPrefs;
  }
  fetch(resource, settings) {
    const permission = "client_network_requests";
    if (hasPermission(this.#component, permission, this.#permissions)) {
      this.#response.fetch.push([resource, settings || {}]);
      return true;
    }
    return false;
  }
  execute(code) {
    const permission = "execute_unsafe_scripts";
    if (hasPermission(this.#component, permission, this.#permissions)) {
      this.#response.execute.push(code);
      return true;
    }
    return false;
  }
  return(value) {
    this.#response.return ||= {};
    this.#response.return[this.#componentPath] = value;
  }
  set(key, value, opts) {
    const cookieKey = this.#componentPath + "__" + key;
    this.#cookies[cookieKey] = value;
    this.#pendingCookies[cookieKey] = { value, opts };
    return true;
  }
  get(key) {
    const cookieKey = this.#componentPath + "__" + key;
    return this.#cookies[cookieKey];
  }
  attachEvent(event) {
    const componentPath = this.#componentPath;
    if (!this.#clientPrefs[componentPath]) {
      this.#clientPrefs[componentPath] = [event];
    } else {
      this.#clientPrefs[componentPath].push(event);
    }
  }
  detachEvent(event) {
    if (!this.#clientPrefs)
      return;
    const componentPath = this.#componentPath;
    const eventIndex = this.#clientPrefs[componentPath]?.indexOf(event);
    if (eventIndex > -1) {
      this.#clientPrefs[componentPath].splice(eventIndex, 1);
    }
  }
};

// src/storage.ts
var set = async (KV, context, key, value) => {
  try {
    const put = KV.put(key, JSON.stringify(value));
    context.waitUntil(put);
    await put;
    return true;
  } catch (e) {
    console.error("Manager set error: ", e);
    return false;
  }
};
var get = async (KV, key) => {
  const value = await KV.get(key);
  try {
    return value ? JSON.parse(value) : value;
  } catch (e) {
    console.error("Manager get error: ", e);
    return null;
  }
};

// src/useCache.ts
var useCache = async (KV, context, key, callback, expirySeconds = 3600) => {
  try {
    const cached = await KV.get(key);
    if (cached)
      return JSON.parse(cached);
    const valueToCache = await callback();
    const put = KV.put(key, JSON.stringify(valueToCache), {
      expirationTtl: expirySeconds
    });
    context.waitUntil(put);
    await put;
    return valueToCache;
  } catch (e) {
    console.error("useCache error: ", e);
  }
};
var invalidateCache = async (KV, context, key) => {
  const del = KV.delete(key);
  context.waitUntil(del);
  return await del;
};

// src/manager.ts
var Manager = class {
  #routePath;
  #listeners;
  #clientListeners;
  component;
  #permissions;
  #debug;
  #response;
  #execContext;
  #env;
  name;
  constructor(context) {
    this.component = context.component;
    this.#listeners = context.events;
    this.#clientListeners = context.clientEvents;
    this.#routePath = context.routePath;
    this.#permissions = context.permissions;
    this.#debug = context.debug;
    this.#response = context.response;
    this.#execContext = context.execContext;
    this.#env = context.env;
    this.name = "Zaraz";
  }
  addEventListener(type, callback) {
    this.#listeners[type] ||= [];
    this.#listeners[type].push(callback);
    return true;
  }
  createEventListener(type, callback) {
    this.#clientListeners[type] = callback;
    return true;
  }
  async get(key) {
    return await get(this.#env.KV, this.component + "__" + key);
  }
  set(key, value) {
    return set(
      this.#env.KV,
      this.#execContext,
      this.component + "__" + key,
      value
    );
  }
  fetch(resource, settings) {
    const fetchCall = globalThis.systemFetch(resource, settings || {});
    this.#execContext.waitUntil(fetchCall);
    if (this.#debug) {
      this.#response.serverFetch.push({
        resource,
        ...settings?.body && {
          payload: settings.body,
          method: settings.method || "GET"
        }
      });
    }
    return fetchCall;
  }
  route(path, callback) {
    const permission = "provide_server_functionality";
    if (hasPermission(this.component, permission, this.#permissions)) {
      const fullPath = this.#routePath + path;
      return fullPath;
    }
    return void 0;
  }
  proxy(path, target) {
    const permission = "provide_server_functionality";
    if (hasPermission(this.component, permission, this.#permissions)) {
      const fullPath = this.#routePath + path;
      return fullPath;
    }
    return void 0;
  }
  serve(path, target) {
    const permission = "serve_static_files";
    if (hasPermission(this.component, permission, this.#permissions)) {
      const fullPath = this.#routePath + path;
      return fullPath;
    }
    return void 0;
  }
  async useCache(key, callback, expiry) {
    return await useCache(
      this.#env.KV,
      this.#execContext,
      this.component + "__" + key,
      callback,
      expiry
    );
  }
  invalidateCache(key) {
    return invalidateCache(
      this.#env.KV,
      this.#execContext,
      this.component + "__" + key
    );
  }
  registerEmbed(name, callback) {
    return true;
  }
  registerWidget(callback) {
    const permission = "provide_widget";
    if (hasPermission(this.component, permission, this.#permissions)) {
    }
    return false;
  }
};

// src/handler.ts
globalThis.systemFetch = globalThis.fetch;
globalThis.fetch = async (resource, _settings) => {
  console.error(
    `Fetch isn't available to Managed Components, please choose client.fetch or manager.fetch. Trying to call: ${JSON.stringify(
      resource
    )}`
  );
  return new Response(
    `Fetch isn't available to Managed Components, please choose client.fetch or manager.fetch. Trying to call: ${JSON.stringify(
      resource
    )}`,
    { status: 500 }
  );
};
var handleRequest = async (request, execContext, env, componentCb) => {
  const context = {
    component: "",
    componentPath: "",
    events: {},
    clientEvents: {},
    routePath: "",
    cookies: {},
    permissions: [],
    debug: false,
    response: {
      fetch: [],
      execute: [],
      return: {},
      pendingCookies: {},
      clientPrefs: {},
      serverFetch: []
    },
    execContext,
    env
  };
  if (request.method === "POST") {
    const url = new URL(request.url);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("no request json data: ", e);
      return new Response(e.toString(), { status: 500 });
    }
    context.componentPath = body.componentPath;
    context.permissions = body.permissions;
    context.component = body.component;
    if (url.pathname === "/init") {
      const manager = new Manager(context);
      const { settings } = body;
      await componentCb(manager, settings);
      const { cookies, ...restOfContext } = context;
      return new Response(
        JSON.stringify({
          ...restOfContext,
          events: Object.keys(context.events),
          clientEvents: Object.keys(context.clientEvents),
          componentPath: context.componentPath
        })
      );
    } else if (url.pathname === "/event") {
      const { eventType, event, settings, clientData, debug } = body;
      const isClientEvent = url.searchParams.get("type") === "client";
      context.cookies = clientData.cookies;
      context.debug = debug;
      const manager = new Manager(context);
      await componentCb(manager, settings);
      event.client = new Client(clientData, context);
      if (isClientEvent) {
        if (Object.keys(context.clientEvents).includes(eventType)) {
          await context.clientEvents[eventType](event);
        }
      } else {
        if (Object.keys(context.events).includes(eventType)) {
          await Promise.all(context.events[eventType].map((fn) => fn(event)));
        }
      }
      return new Response(
        JSON.stringify({
          componentPath: context.componentPath,
          ...context.response
        })
      );
    }
  } else {
    return new Response("External MC Test \u2705");
  }
  return new Response("Invalid Path or Method", { status: 404 });
};

// src/index.ts
var src_default = {
  async fetch(request, env, execContext) {
    return handleRequest(request, execContext, env, m);
  }
};

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
var jsonError = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;
var wrap = void 0;

// .wrangler/tmp/bundle-7lCSgx/middleware-insertion-facade.js
var envWrappers = [wrap].filter(Boolean);
var facade = {
  ...src_default,
  envWrappers,
  middleware: [
    middleware_miniflare3_json_error_default,
    ...src_default.middleware ? src_default.middleware : []
  ].filter(Boolean)
};
var middleware_insertion_facade_default = facade;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-7lCSgx/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
var __facade_modules_fetch__ = function(request, env, ctx) {
  if (middleware_insertion_facade_default.fetch === void 0)
    throw new Error("Handler does not export a fetch() function.");
  return middleware_insertion_facade_default.fetch(request, env, ctx);
};
function getMaskedEnv(rawEnv) {
  let env = rawEnv;
  if (middleware_insertion_facade_default.envWrappers && middleware_insertion_facade_default.envWrappers.length > 0) {
    for (const wrapFn of middleware_insertion_facade_default.envWrappers) {
      env = wrapFn(env);
    }
  }
  return env;
}
var registeredMiddleware = false;
var facade2 = {
  ...middleware_insertion_facade_default.tail && {
    tail: maskHandlerEnv(middleware_insertion_facade_default.tail)
  },
  ...middleware_insertion_facade_default.trace && {
    trace: maskHandlerEnv(middleware_insertion_facade_default.trace)
  },
  ...middleware_insertion_facade_default.scheduled && {
    scheduled: maskHandlerEnv(middleware_insertion_facade_default.scheduled)
  },
  ...middleware_insertion_facade_default.queue && {
    queue: maskHandlerEnv(middleware_insertion_facade_default.queue)
  },
  ...middleware_insertion_facade_default.test && {
    test: maskHandlerEnv(middleware_insertion_facade_default.test)
  },
  ...middleware_insertion_facade_default.email && {
    email: maskHandlerEnv(middleware_insertion_facade_default.email)
  },
  fetch(request, rawEnv, ctx) {
    const env = getMaskedEnv(rawEnv);
    if (middleware_insertion_facade_default.middleware && middleware_insertion_facade_default.middleware.length > 0) {
      if (!registeredMiddleware) {
        registeredMiddleware = true;
        for (const middleware of middleware_insertion_facade_default.middleware) {
          __facade_register__(middleware);
        }
      }
      const __facade_modules_dispatch__ = function(type, init) {
        if (type === "scheduled" && middleware_insertion_facade_default.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return middleware_insertion_facade_default.scheduled(controller, env, ctx);
        }
      };
      return __facade_invoke__(
        request,
        env,
        ctx,
        __facade_modules_dispatch__,
        __facade_modules_fetch__
      );
    } else {
      return __facade_modules_fetch__(request, env, ctx);
    }
  }
};
function maskHandlerEnv(handler) {
  return (data, env, ctx) => handler(data, getMaskedEnv(env), ctx);
}
var middleware_loader_entry_default = facade2;
export {
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
