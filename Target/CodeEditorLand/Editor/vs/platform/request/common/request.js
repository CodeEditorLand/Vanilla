var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { streamToBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { getErrorMessage } from "../../../base/common/errors.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IHeaders, IRequestContext, IRequestOptions } from "../../../base/parts/request/common/request.js";
import { localize } from "../../../nls.js";
import { ConfigurationScope, Extensions, IConfigurationNode, IConfigurationRegistry } from "../../configuration/common/configurationRegistry.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { Registry } from "../../registry/common/platform.js";
const IRequestService = createDecorator("requestService");
class LoggableHeaders {
  constructor(original) {
    this.original = original;
  }
  static {
    __name(this, "LoggableHeaders");
  }
  headers;
  toJSON() {
    if (!this.headers) {
      const headers = /* @__PURE__ */ Object.create(null);
      for (const key in this.original) {
        if (key.toLowerCase() === "authorization" || key.toLowerCase() === "proxy-authorization") {
          headers[key] = "*****";
        } else {
          headers[key] = this.original[key];
        }
      }
      this.headers = headers;
    }
    return this.headers;
  }
}
class AbstractRequestService extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
  }
  static {
    __name(this, "AbstractRequestService");
  }
  counter = 0;
  async logAndRequest(options, request) {
    const prefix = `[network] #${++this.counter}: ${options.url}`;
    this.logService.trace(`${prefix} - begin`, options.type, new LoggableHeaders(options.headers ?? {}));
    try {
      const result = await request();
      this.logService.trace(`${prefix} - end`, options.type, result.res.statusCode, result.res.headers);
      return result;
    } catch (error) {
      this.logService.error(`${prefix} - error`, options.type, getErrorMessage(error));
      throw error;
    }
  }
}
function isSuccess(context) {
  return context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300 || context.res.statusCode === 1223;
}
__name(isSuccess, "isSuccess");
function hasNoContent(context) {
  return context.res.statusCode === 204;
}
__name(hasNoContent, "hasNoContent");
async function asText(context) {
  if (hasNoContent(context)) {
    return null;
  }
  const buffer = await streamToBuffer(context.stream);
  return buffer.toString();
}
__name(asText, "asText");
async function asTextOrError(context) {
  if (!isSuccess(context)) {
    throw new Error("Server returned " + context.res.statusCode);
  }
  return asText(context);
}
__name(asTextOrError, "asTextOrError");
async function asJson(context) {
  if (!isSuccess(context)) {
    throw new Error("Server returned " + context.res.statusCode);
  }
  if (hasNoContent(context)) {
    return null;
  }
  const buffer = await streamToBuffer(context.stream);
  const str = buffer.toString();
  try {
    return JSON.parse(str);
  } catch (err) {
    err.message += ":\n" + str;
    throw err;
  }
}
__name(asJson, "asJson");
function updateProxyConfigurationsScope(scope) {
  registerProxyConfigurations(scope);
}
__name(updateProxyConfigurationsScope, "updateProxyConfigurationsScope");
let proxyConfiguration;
function registerProxyConfigurations(scope) {
  const configurationRegistry = Registry.as(Extensions.Configuration);
  const oldProxyConfiguration = proxyConfiguration;
  proxyConfiguration = {
    id: "http",
    order: 15,
    title: localize("httpConfigurationTitle", "HTTP"),
    type: "object",
    scope,
    properties: {
      "http.proxy": {
        type: "string",
        pattern: "^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$",
        markdownDescription: localize("proxy", "The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),
        restricted: true
      },
      "http.proxyStrictSSL": {
        type: "boolean",
        default: true,
        description: localize("strictSSL", "Controls whether the proxy server certificate should be verified against the list of supplied CAs."),
        restricted: true
      },
      "http.proxyKerberosServicePrincipal": {
        type: "string",
        markdownDescription: localize("proxyKerberosServicePrincipal", "Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set."),
        restricted: true
      },
      "http.noProxy": {
        type: "array",
        items: { type: "string" },
        markdownDescription: localize("noProxy", "Specifies domain names for which proxy settings should be ignored for HTTP/HTTPS requests."),
        restricted: true
      },
      "http.proxyAuthorization": {
        type: ["null", "string"],
        default: null,
        markdownDescription: localize("proxyAuthorization", "The value to send as the `Proxy-Authorization` header for every network request."),
        restricted: true
      },
      "http.proxySupport": {
        type: "string",
        enum: ["off", "on", "fallback", "override"],
        enumDescriptions: [
          localize("proxySupportOff", "Disable proxy support for extensions."),
          localize("proxySupportOn", "Enable proxy support for extensions."),
          localize("proxySupportFallback", "Enable proxy support for extensions, fall back to request options, when no proxy found."),
          localize("proxySupportOverride", "Enable proxy support for extensions, override request options.")
        ],
        default: "override",
        description: localize("proxySupport", "Use the proxy support for extensions."),
        restricted: true
      },
      "http.systemCertificates": {
        type: "boolean",
        default: true,
        description: localize("systemCertificates", "Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),
        restricted: true
      },
      "http.experimental.systemCertificatesV2": {
        type: "boolean",
        tags: ["experimental"],
        default: false,
        description: localize("systemCertificatesV2", "Controls whether experimental loading of CA certificates from the OS should be enabled. This uses a more general approach than the default implemenation."),
        restricted: true
      }
    }
  };
  configurationRegistry.updateConfigurations({ add: [proxyConfiguration], remove: oldProxyConfiguration ? [oldProxyConfiguration] : [] });
}
__name(registerProxyConfigurations, "registerProxyConfigurations");
registerProxyConfigurations(ConfigurationScope.APPLICATION);
export {
  AbstractRequestService,
  IRequestService,
  asJson,
  asText,
  asTextOrError,
  hasNoContent,
  isSuccess,
  updateProxyConfigurationsScope
};
//# sourceMappingURL=request.js.map
