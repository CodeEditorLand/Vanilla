import { VSBuffer, bufferToStream } from "../../../common/buffer.js";
import { canceled } from "../../../common/errors.js";
import {
  OfflineError
} from "../common/request.js";
async function request(options, token) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  const cancellation = new AbortController();
  const disposable = token.onCancellationRequested(
    () => cancellation.abort()
  );
  const signal = options.timeout ? AbortSignal.any([
    cancellation.signal,
    AbortSignal.timeout(options.timeout)
  ]) : cancellation.signal;
  try {
    const res = await fetch(options.url || "", {
      method: options.type || "GET",
      headers: getRequestHeaders(options),
      body: options.data,
      signal
    });
    return {
      res: {
        statusCode: res.status,
        headers: getResponseHeaders(res)
      },
      stream: bufferToStream(
        VSBuffer.wrap(new Uint8Array(await res.arrayBuffer()))
      )
    };
  } catch (err) {
    if (!navigator.onLine) {
      throw new OfflineError();
    }
    if (err?.name === "AbortError") {
      throw canceled();
    }
    if (err?.name === "TimeoutError") {
      throw new Error(`Fetch timeout: ${options.timeout}ms`);
    }
    throw err;
  } finally {
    disposable.dispose();
  }
}
function getRequestHeaders(options) {
  if (options.headers || options.user || options.password || options.proxyAuthorization) {
    const headers = new Headers();
    outer: for (const k in options.headers) {
      switch (k.toLowerCase()) {
        case "user-agent":
        case "accept-encoding":
        case "content-length":
          continue outer;
      }
      const header = options.headers[k];
      if (typeof header === "string") {
        headers.set(k, header);
      } else if (Array.isArray(header)) {
        for (const h of header) {
          headers.append(k, h);
        }
      }
    }
    if (options.user || options.password) {
      headers.set(
        "Authorization",
        "Basic " + btoa(`${options.user || ""}:${options.password || ""}`)
      );
    }
    if (options.proxyAuthorization) {
      headers.set("Proxy-Authorization", options.proxyAuthorization);
    }
    return headers;
  }
  return void 0;
}
function getResponseHeaders(res) {
  const headers = /* @__PURE__ */ Object.create(null);
  res.headers.forEach((value, key) => {
    if (headers[key]) {
      if (Array.isArray(headers[key])) {
        headers[key].push(value);
      } else {
        headers[key] = [headers[key], value];
      }
    } else {
      headers[key] = value;
    }
  });
  return headers;
}
export {
  request
};
