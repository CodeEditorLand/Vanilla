var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { parse as parseUrl } from "url";
import { createGunzip } from "zlib";
import { Promises } from "../../../base/common/async.js";
import { streamToBufferReadableStream } from "../../../base/common/buffer.js";
import {
  CancellationError,
  getErrorMessage
} from "../../../base/common/errors.js";
import { isBoolean, isNumber } from "../../../base/common/types.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { ILogService } from "../../log/common/log.js";
import { getResolvedShellEnv } from "../../shell/node/shellEnv.js";
import {
  AbstractRequestService
} from "../common/request.js";
import { getProxyAgent } from "./proxy.js";
let RequestService = class extends AbstractRequestService {
  constructor(configurationService, environmentService, logService) {
    super(logService);
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.configure();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("http")) {
        this.configure();
      }
    }));
  }
  static {
    __name(this, "RequestService");
  }
  proxyUrl;
  strictSSL;
  authorization;
  shellEnvErrorLogged;
  configure() {
    const config = this.configurationService.getValue("http");
    this.proxyUrl = config?.proxy;
    this.strictSSL = !!config?.proxyStrictSSL;
    this.authorization = config?.proxyAuthorization;
  }
  async request(options, token) {
    const { proxyUrl, strictSSL } = this;
    let shellEnv;
    try {
      shellEnv = await getResolvedShellEnv(
        this.configurationService,
        this.logService,
        this.environmentService.args,
        process.env
      );
    } catch (error) {
      if (!this.shellEnvErrorLogged) {
        this.shellEnvErrorLogged = true;
        this.logService.error(
          `resolving shell environment failed`,
          getErrorMessage(error)
        );
      }
    }
    const env = {
      ...process.env,
      ...shellEnv
    };
    const agent = options.agent ? options.agent : await getProxyAgent(options.url || "", env, {
      proxyUrl,
      strictSSL
    });
    options.agent = agent;
    options.strictSSL = strictSSL;
    if (this.authorization) {
      options.headers = {
        ...options.headers || {},
        "Proxy-Authorization": this.authorization
      };
    }
    return this.logAndRequest(options, () => nodeRequest(options, token));
  }
  async resolveProxy(url) {
    return void 0;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(urlStr) {
    try {
      const kerberos = await import("kerberos");
      const url = new URL(urlStr);
      const spn = this.configurationService.getValue(
        "http.proxyKerberosServicePrincipal"
      ) || (process.platform === "win32" ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
      this.logService.debug(
        "RequestService#lookupKerberosAuthorization Kerberos authentication lookup",
        `proxyURL:${url}`,
        `spn:${spn}`
      );
      const client = await kerberos.initializeClient(spn);
      const response = await client.step("");
      return "Negotiate " + response;
    } catch (err) {
      this.logService.debug(
        "RequestService#lookupKerberosAuthorization Kerberos authentication failed",
        err
      );
      return void 0;
    }
  }
  async loadCertificates() {
    const proxyAgent = await import("@vscode/proxy-agent");
    return proxyAgent.loadSystemCertificates({ log: this.logService });
  }
};
RequestService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, ILogService)
], RequestService);
async function getNodeRequest(options) {
  const endpoint = parseUrl(options.url);
  const module = endpoint.protocol === "https:" ? await import("https") : await import("http");
  return module.request;
}
__name(getNodeRequest, "getNodeRequest");
async function nodeRequest(options, token) {
  return Promises.withAsyncBody(async (resolve, reject) => {
    const endpoint = parseUrl(options.url);
    const rawRequest = options.getRawRequest ? options.getRawRequest(options) : await getNodeRequest(options);
    const opts = {
      hostname: endpoint.hostname,
      port: endpoint.port ? Number.parseInt(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80,
      protocol: endpoint.protocol,
      path: endpoint.path,
      method: options.type || "GET",
      headers: options.headers,
      agent: options.agent,
      rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
    };
    if (options.user && options.password) {
      opts.auth = options.user + ":" + options.password;
    }
    const req = rawRequest(opts, (res) => {
      const followRedirects = isNumber(options.followRedirects) ? options.followRedirects : 3;
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers["location"]) {
        nodeRequest(
          {
            ...options,
            url: res.headers["location"],
            followRedirects: followRedirects - 1
          },
          token
        ).then(resolve, reject);
      } else {
        let stream = res;
        if (!options.isChromiumNetwork && res.headers["content-encoding"] === "gzip") {
          stream = res.pipe(createGunzip());
        }
        resolve({
          res,
          stream: streamToBufferReadableStream(stream)
        });
      }
    });
    req.on("error", reject);
    if (options.timeout) {
      req.setTimeout(options.timeout);
    }
    if (options.isChromiumNetwork) {
      req.removeHeader("Content-Length");
    }
    if (options.data) {
      if (typeof options.data === "string") {
        req.write(options.data);
      }
    }
    req.end();
    token.onCancellationRequested(() => {
      req.abort();
      reject(new CancellationError());
    });
  });
}
__name(nodeRequest, "nodeRequest");
export {
  RequestService,
  nodeRequest
};
//# sourceMappingURL=requestService.js.map
