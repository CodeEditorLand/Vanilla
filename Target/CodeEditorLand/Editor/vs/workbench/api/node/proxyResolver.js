import { createRequire } from "node:module";
import {
  createHttpPatch,
  createNetPatch,
  createProxyResolver,
  createTlsPatch,
  loadSystemCertificates,
  LogLevel
} from "@vscode/proxy-agent";
import { URI } from "../../../base/common/uri.js";
import {
  LogLevel as LogServiceLevel
} from "../../../platform/log/common/log.js";
const require2 = createRequire(import.meta.url);
const http = require2("http");
const https = require2("https");
const tls = require2("tls");
const net = require2("net");
const systemCertificatesV2Default = false;
function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData) {
  const useHostProxy = initData.environment.useHostProxy;
  const doUseHostProxy = typeof useHostProxy === "boolean" ? useHostProxy : !initData.remote.isRemote;
  const params = {
    resolveProxy: (url) => extHostWorkspace.resolveProxy(url),
    lookupProxyAuthorization: lookupProxyAuthorization.bind(
      void 0,
      extHostWorkspace,
      extHostLogService,
      mainThreadTelemetry,
      configProvider,
      {},
      {},
      initData.remote.isRemote,
      doUseHostProxy
    ),
    getProxyURL: () => configProvider.getConfiguration("http").get("proxy"),
    getProxySupport: () => configProvider.getConfiguration("http").get("proxySupport") || "off",
    getNoProxyConfig: () => configProvider.getConfiguration("http").get("noProxy") || [],
    addCertificatesV1: () => certSettingV1(configProvider),
    addCertificatesV2: () => certSettingV2(configProvider),
    log: extHostLogService,
    getLogLevel: () => {
      const level = extHostLogService.getLevel();
      switch (level) {
        case LogServiceLevel.Trace:
          return LogLevel.Trace;
        case LogServiceLevel.Debug:
          return LogLevel.Debug;
        case LogServiceLevel.Info:
          return LogLevel.Info;
        case LogServiceLevel.Warning:
          return LogLevel.Warning;
        case LogServiceLevel.Error:
          return LogLevel.Error;
        case LogServiceLevel.Off:
          return LogLevel.Off;
        default:
          return never(level);
      }
      function never(level2) {
        extHostLogService.error("Unknown log level", level2);
        return LogLevel.Debug;
      }
    },
    proxyResolveTelemetry: () => {
    },
    useHostProxy: doUseHostProxy,
    loadAdditionalCertificates: async () => {
      const promises = [];
      if (initData.remote.isRemote) {
        promises.push(
          loadSystemCertificates({ log: extHostLogService })
        );
      }
      if (doUseHostProxy) {
        extHostLogService.trace(
          "ProxyResolver#loadAdditionalCertificates: Loading certificates from main process"
        );
        const certs = extHostWorkspace.loadCertificates();
        certs.then(
          (certs2) => extHostLogService.trace(
            "ProxyResolver#loadAdditionalCertificates: Loaded certificates from main process",
            certs2.length
          )
        );
        promises.push(certs);
      }
      if (initData.environment.extensionTestsLocationURI && https.globalAgent.testCertificates?.length) {
        extHostLogService.trace(
          "ProxyResolver#loadAdditionalCertificates: Loading test certificates"
        );
        promises.push(
          Promise.resolve(
            https.globalAgent.testCertificates
          )
        );
      }
      return (await Promise.all(promises)).flat();
    },
    env: process.env
  };
  const resolveProxy = createProxyResolver(params);
  const lookup = createPatchedModules(params, resolveProxy);
  return configureModuleLoading(extensionService, lookup);
}
function createPatchedModules(params, resolveProxy) {
  function mergeModules(module, patch) {
    return Object.assign(module.default || module, patch);
  }
  return {
    http: mergeModules(http, createHttpPatch(params, http, resolveProxy)),
    https: mergeModules(
      https,
      createHttpPatch(params, https, resolveProxy)
    ),
    net: mergeModules(net, createNetPatch(params, net)),
    tls: mergeModules(tls, createTlsPatch(params, tls))
  };
}
function certSettingV1(configProvider) {
  const http2 = configProvider.getConfiguration("http");
  return !http2.get(
    "experimental.systemCertificatesV2",
    systemCertificatesV2Default
  ) && !!http2.get("systemCertificates");
}
function certSettingV2(configProvider) {
  const http2 = configProvider.getConfiguration("http");
  return !!http2.get(
    "experimental.systemCertificatesV2",
    systemCertificatesV2Default
  ) && !!http2.get("systemCertificates");
}
const modulesCache = /* @__PURE__ */ new Map();
function configureModuleLoading(extensionService, lookup) {
  return extensionService.getExtensionPathIndex().then((extensionPaths) => {
    const node_module = require2("module");
    const original = node_module._load;
    node_module._load = function load(request, parent, isMain) {
      if (request === "net") {
        return lookup.net;
      }
      if (request === "tls") {
        return lookup.tls;
      }
      if (request !== "http" && request !== "https") {
        return original.apply(this, arguments);
      }
      const ext = extensionPaths.findSubstr(URI.file(parent.filename));
      let cache = modulesCache.get(ext);
      if (!cache) {
        modulesCache.set(ext, cache = {});
      }
      if (!cache[request]) {
        const mod = lookup[request];
        cache[request] = { ...mod };
      }
      return cache[request];
    };
  });
}
async function lookupProxyAuthorization(extHostWorkspace, extHostLogService, mainThreadTelemetry, configProvider, proxyAuthenticateCache, basicAuthCache, isRemote, useHostProxy, proxyURL, proxyAuthenticate, state) {
  const cached = proxyAuthenticateCache[proxyURL];
  if (proxyAuthenticate) {
    proxyAuthenticateCache[proxyURL] = proxyAuthenticate;
  }
  extHostLogService.trace(
    "ProxyResolver#lookupProxyAuthorization callback",
    `proxyURL:${proxyURL}`,
    `proxyAuthenticate:${proxyAuthenticate}`,
    `proxyAuthenticateCache:${cached}`
  );
  const header = proxyAuthenticate || cached;
  const authenticate = Array.isArray(header) ? header : typeof header === "string" ? [header] : [];
  sendTelemetry(mainThreadTelemetry, authenticate, isRemote);
  if (authenticate.some((a) => /^(Negotiate|Kerberos)( |$)/i.test(a)) && !state.kerberosRequested) {
    state.kerberosRequested = true;
    try {
      const kerberos = await import("kerberos");
      const url = new URL(proxyURL);
      const spn = configProvider.getConfiguration("http").get("proxyKerberosServicePrincipal") || (process.platform === "win32" ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
      extHostLogService.debug(
        "ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup",
        `proxyURL:${proxyURL}`,
        `spn:${spn}`
      );
      const client = await kerberos.initializeClient(spn);
      const response = await client.step("");
      return "Negotiate " + response;
    } catch (err) {
      extHostLogService.debug(
        "ProxyResolver#lookupProxyAuthorization Kerberos authentication failed",
        err
      );
    }
    if (isRemote && useHostProxy) {
      extHostLogService.debug(
        "ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup on host",
        `proxyURL:${proxyURL}`
      );
      const auth = await extHostWorkspace.lookupKerberosAuthorization(proxyURL);
      if (auth) {
        return "Negotiate " + auth;
      }
    }
  }
  const basicAuthHeader = authenticate.find((a) => /^Basic( |$)/i.test(a));
  if (basicAuthHeader) {
    try {
      const cachedAuth = basicAuthCache[proxyURL];
      if (cachedAuth) {
        if (state.basicAuthCacheUsed) {
          extHostLogService.debug(
            "ProxyResolver#lookupProxyAuthorization Basic authentication deleting cached credentials",
            `proxyURL:${proxyURL}`
          );
          delete basicAuthCache[proxyURL];
        } else {
          extHostLogService.debug(
            "ProxyResolver#lookupProxyAuthorization Basic authentication using cached credentials",
            `proxyURL:${proxyURL}`
          );
          state.basicAuthCacheUsed = true;
          return cachedAuth;
        }
      }
      state.basicAuthAttempt = (state.basicAuthAttempt || 0) + 1;
      const realm = / realm="([^"]+)"/i.exec(basicAuthHeader)?.[1];
      extHostLogService.debug(
        "ProxyResolver#lookupProxyAuthorization Basic authentication lookup",
        `proxyURL:${proxyURL}`,
        `realm:${realm}`
      );
      const url = new URL(proxyURL);
      const authInfo = {
        scheme: "basic",
        host: url.hostname,
        port: Number(url.port),
        realm: realm || "",
        isProxy: true,
        attempt: state.basicAuthAttempt
      };
      const credentials = await extHostWorkspace.lookupAuthorization(authInfo);
      if (credentials) {
        extHostLogService.debug(
          "ProxyResolver#lookupProxyAuthorization Basic authentication received credentials",
          `proxyURL:${proxyURL}`,
          `realm:${realm}`
        );
        const auth = "Basic " + Buffer.from(
          `${credentials.username}:${credentials.password}`
        ).toString("base64");
        basicAuthCache[proxyURL] = auth;
        return auth;
      } else {
        extHostLogService.debug(
          "ProxyResolver#lookupProxyAuthorization Basic authentication received no credentials",
          `proxyURL:${proxyURL}`,
          `realm:${realm}`
        );
      }
    } catch (err) {
      extHostLogService.error(
        "ProxyResolver#lookupProxyAuthorization Basic authentication failed",
        err
      );
    }
  }
  return void 0;
}
let telemetrySent = false;
function sendTelemetry(mainThreadTelemetry, authenticate, isRemote) {
  if (telemetrySent || !authenticate.length) {
    return;
  }
  telemetrySent = true;
  mainThreadTelemetry.$publicLog2("proxyAuthenticationRequest", {
    authenticationType: authenticate.map((a) => a.split(" ")[0]).join(","),
    extensionHostType: isRemote ? "remote" : "local"
  });
}
export {
  connectProxyResolver
};
