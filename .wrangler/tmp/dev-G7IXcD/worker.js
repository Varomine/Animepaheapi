var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-9gm8ka/checked-fetch.js
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
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type"
        }
      });
    }
    if (url.pathname === "/proxy") {
      const targetUrl = url.searchParams.get("url");
      const customReferer = url.searchParams.get("referer");
      if (!targetUrl) {
        return new Response(JSON.stringify({
          error: 'Query parameter "url" is required',
          usage: "GET /proxy?url=<m3u8-or-ts-url>&referer=<optional-referer>"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (targetUrl.includes("kwik.cx/e/") || targetUrl.includes("kwik.si/e/") || targetUrl.match(/kwik\.[a-z]+\/e\//)) {
        try {
          const fetchResponse = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": "https://animepahe.com/"
            }
          });
          if (!fetchResponse.ok) {
            throw new Error(`Kwik returned status ${fetchResponse.status}`);
          }
          const html = await fetchResponse.text();
          let m3u8Url = null;
          const packerRegex = /eval\(function\(p,a,c,k,e,d\).*?return p}\('(.*?)',(\d+),(\d+),'([^']+)'\.split\('\|'\)/g;
          let match;
          const unpack = /* @__PURE__ */ __name((p, a, c, k) => {
            const e = /* @__PURE__ */ __name((c2) => {
              return (c2 < a ? "" : e(parseInt(c2 / a))) + ((c2 = c2 % a) > 35 ? String.fromCharCode(c2 + 29) : c2.toString(36));
            }, "e");
            while (c--) {
              if (k[c]) {
                p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
              }
            }
            return p;
          }, "unpack");
          while ((match = packerRegex.exec(html)) !== null) {
            const dict = match[4];
            if (dict.includes("m3u8")) {
              const p = match[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
              const a = parseInt(match[2], 10);
              const c = parseInt(match[3], 10);
              const k = dict.split("|");
              const unpacked = unpack(p, a, c, k);
              const m3u8Match = unpacked.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/);
              if (m3u8Match) {
                m3u8Url = m3u8Match[1];
                break;
              }
            }
          }
          if (!m3u8Url) {
            const dataSrcMatch = html.match(/data-src="([^"]+\.m3u8[^"]*)"/);
            if (dataSrcMatch) m3u8Url = dataSrcMatch[1];
          }
          if (m3u8Url) {
            const redirectUrl = `/proxy?url=${encodeURIComponent(m3u8Url)}&referer=${encodeURIComponent(targetUrl)}`;
            return Response.redirect(new URL(redirectUrl, request.url).href, 302);
          } else {
            throw new Error("Could not extract m3u8 link from Kwik source");
          }
        } catch (e) {
          return new Response(JSON.stringify({
            error: "Failed to resolve Kwik URL inside Worker",
            details: e.message
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
      const targetUrlObj = new URL(targetUrl);
      const referer = customReferer || `${targetUrlObj.protocol}//${targetUrlObj.host}/`;
      try {
        const fetchResponse = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": referer,
            "Origin": referer.slice(0, -1),
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site"
          }
        });
        if (fetchResponse.status === 403) {
          return new Response(JSON.stringify({ error: "Access forbidden - CDN blocked the request" }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const contentType = fetchResponse.headers.get("content-type") || (targetUrl.includes(".m3u8") ? "application/vnd.apple.mpegurl" : targetUrl.includes(".ts") ? "video/mp2t" : "application/octet-stream");
        if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8")) {
          const content = await fetchResponse.text();
          const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
          const refererParam = customReferer ? `&referer=${encodeURIComponent(customReferer)}` : "";
          const modified = content.split("\n").map((line) => {
            const t = line.trim();
            if (t.startsWith("#")) {
              if (t.includes('URI="')) {
                return t.replace(/URI="([^"]+)"/, (match, uri) => {
                  let fullUrl = uri;
                  if (!uri.startsWith("http")) {
                    fullUrl = baseUrl + uri;
                  }
                  return `URI="/proxy?url=${encodeURIComponent(fullUrl)}${refererParam}"`;
                });
              }
              return line;
            } else if (t && !t.startsWith("http")) {
              return `/proxy?url=${encodeURIComponent(baseUrl + t)}${refererParam}`;
            } else if (t.startsWith("http")) {
              return `/proxy?url=${encodeURIComponent(t)}${refererParam}`;
            }
            return line;
          }).join("\n");
          return new Response(modified, {
            headers: {
              "Content-Type": contentType,
              "Access-Control-Allow-Origin": "*"
            }
          });
        } else {
          const headers = new Headers();
          headers.set("Content-Type", contentType);
          headers.set("Access-Control-Allow-Origin", "*");
          headers.set("Accept-Ranges", "bytes");
          const contentLength = fetchResponse.headers.get("content-length");
          if (contentLength) headers.set("Content-Length", contentLength);
          const contentRange = fetchResponse.headers.get("content-range");
          if (contentRange) headers.set("Content-Range", contentRange);
          return new Response(fetchResponse.body, {
            status: fetchResponse.status,
            headers
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    return new Response("Animepahe Proxy is running on Cloudflare Workers! Use /proxy?url=...", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-9gm8ka/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
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
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-9gm8ka/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
