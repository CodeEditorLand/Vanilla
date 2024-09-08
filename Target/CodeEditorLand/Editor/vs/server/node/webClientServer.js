var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as crypto from "crypto";
import { createReadStream, promises } from "fs";
import * as path from "path";
import * as url from "url";
import * as cookie from "cookie";
import { isESM } from "../../base/common/amd.js";
import { streamToBuffer } from "../../base/common/buffer.js";
import { CancellationToken } from "../../base/common/cancellation.js";
import { CharCode } from "../../base/common/charCode.js";
import { isEqualOrParent } from "../../base/common/extpath.js";
import { getMediaMime } from "../../base/common/mime.js";
import {
  builtinExtensionsPath,
  connectionTokenCookieName,
  connectionTokenQueryName,
  FileAccess,
  Schemas
} from "../../base/common/network.js";
import { dirname, extname, join, normalize } from "../../base/common/path.js";
import { isLinux } from "../../base/common/platform.js";
import { isString } from "../../base/common/types.js";
import { URI } from "../../base/common/uri.js";
import { generateUuid } from "../../base/common/uuid.js";
import { ICSSDevelopmentService } from "../../platform/cssDev/node/cssDevService.js";
import { ILogService } from "../../platform/log/common/log.js";
import { IProductService } from "../../platform/product/common/productService.js";
import {
  asTextOrError,
  IRequestService
} from "../../platform/request/common/request.js";
import {
  ServerConnectionTokenType
} from "./serverConnectionToken.js";
import { IServerEnvironmentService } from "./serverEnvironmentService.js";
const textMimeType = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".svg": "image/svg+xml"
};
async function serveError(req, res, errorCode, errorMessage) {
  res.writeHead(errorCode, { "Content-Type": "text/plain" });
  res.end(errorMessage);
}
var CacheControl = /* @__PURE__ */ ((CacheControl2) => {
  CacheControl2[CacheControl2["NO_CACHING"] = 0] = "NO_CACHING";
  CacheControl2[CacheControl2["ETAG"] = 1] = "ETAG";
  CacheControl2[CacheControl2["NO_EXPIRY"] = 2] = "NO_EXPIRY";
  return CacheControl2;
})(CacheControl || {});
async function serveFile(filePath, cacheControl, logService, req, res, responseHeaders) {
  try {
    const stat = await promises.stat(filePath);
    if (cacheControl === 1 /* ETAG */) {
      const etag = `W/"${[stat.ino, stat.size, stat.mtime.getTime()].join("-")}"`;
      if (req.headers["if-none-match"] === etag) {
        res.writeHead(304);
        return void res.end();
      }
      responseHeaders["Etag"] = etag;
    } else if (cacheControl === 2 /* NO_EXPIRY */) {
      responseHeaders["Cache-Control"] = "public, max-age=31536000";
    } else if (cacheControl === 0 /* NO_CACHING */) {
      responseHeaders["Cache-Control"] = "no-store";
    }
    responseHeaders["Content-Type"] = textMimeType[extname(filePath)] || getMediaMime(filePath) || "text/plain";
    res.writeHead(200, responseHeaders);
    createReadStream(filePath).pipe(res);
  } catch (error) {
    if (error.code !== "ENOENT") {
      logService.error(error);
      console.error(error.toString());
    } else {
      console.error(`File not found: ${filePath}`);
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    return void res.end("Not found");
  }
}
const APP_ROOT = dirname(FileAccess.asFileUri("").fsPath);
let WebClientServer = class {
  constructor(_connectionToken, _basePath, serverRootPath, _environmentService, _logService, _requestService, _productService, _cssDevService) {
    this._connectionToken = _connectionToken;
    this._basePath = _basePath;
    this.serverRootPath = serverRootPath;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._requestService = _requestService;
    this._productService = _productService;
    this._cssDevService = _cssDevService;
    this._webExtensionResourceUrlTemplate = this._productService.extensionsGallery?.resourceUrlTemplate ? URI.parse(
      this._productService.extensionsGallery.resourceUrlTemplate
    ) : void 0;
    this._staticRoute = `${serverRootPath}/static`;
    this._callbackRoute = `${serverRootPath}/callback`;
    this._webExtensionRoute = `${serverRootPath}/web-extension-resource`;
  }
  _webExtensionResourceUrlTemplate;
  _staticRoute;
  _callbackRoute;
  _webExtensionRoute;
  /**
   * Handle web resources (i.e. only needed by the web client).
   * **NOTE**: This method is only invoked when the server has web bits.
   * **NOTE**: This method is only invoked after the connection token has been validated.
   */
  async handle(req, res, parsedUrl) {
    try {
      const pathname = parsedUrl.pathname;
      if (pathname.startsWith(this._staticRoute) && pathname.charCodeAt(this._staticRoute.length) === CharCode.Slash) {
        return this._handleStatic(req, res, parsedUrl);
      }
      if (pathname === this._basePath) {
        return this._handleRoot(req, res, parsedUrl);
      }
      if (pathname === this._callbackRoute) {
        return this._handleCallback(res);
      }
      if (pathname.startsWith(this._webExtensionRoute) && pathname.charCodeAt(this._webExtensionRoute.length) === CharCode.Slash) {
        return this._handleWebExtensionResource(req, res, parsedUrl);
      }
      return serveError(req, res, 404, "Not found.");
    } catch (error) {
      this._logService.error(error);
      console.error(error.toString());
      return serveError(req, res, 500, "Internal Server Error.");
    }
  }
  /**
   * Handle HTTP requests for /static/*
   */
  async _handleStatic(req, res, parsedUrl) {
    const headers = /* @__PURE__ */ Object.create(null);
    const normalizedPathname = decodeURIComponent(parsedUrl.pathname);
    const relativeFilePath = normalizedPathname.substring(
      this._staticRoute.length + 1
    );
    const filePath = join(APP_ROOT, relativeFilePath);
    if (!isEqualOrParent(filePath, APP_ROOT, !isLinux)) {
      return serveError(req, res, 400, `Bad request.`);
    }
    return serveFile(
      filePath,
      this._environmentService.isBuilt ? 2 /* NO_EXPIRY */ : 1 /* ETAG */,
      this._logService,
      req,
      res,
      headers
    );
  }
  _getResourceURLTemplateAuthority(uri) {
    const index = uri.authority.indexOf(".");
    return index !== -1 ? uri.authority.substring(index + 1) : void 0;
  }
  /**
   * Handle extension resources
   */
  async _handleWebExtensionResource(req, res, parsedUrl) {
    if (!this._webExtensionResourceUrlTemplate) {
      return serveError(
        req,
        res,
        500,
        "No extension gallery service configured."
      );
    }
    const normalizedPathname = decodeURIComponent(parsedUrl.pathname);
    const path2 = normalize(
      normalizedPathname.substring(this._webExtensionRoute.length + 1)
    );
    const uri = URI.parse(path2).with({
      scheme: this._webExtensionResourceUrlTemplate.scheme,
      authority: path2.substring(0, path2.indexOf("/")),
      path: path2.substring(path2.indexOf("/") + 1)
    });
    if (this._getResourceURLTemplateAuthority(
      this._webExtensionResourceUrlTemplate
    ) !== this._getResourceURLTemplateAuthority(uri)) {
      return serveError(req, res, 403, "Request Forbidden");
    }
    const headers = {};
    const setRequestHeader = (header) => {
      const value = req.headers[header];
      if (value && (isString(value) || value[0])) {
        headers[header] = isString(value) ? value : value[0];
      } else if (header !== header.toLowerCase()) {
        setRequestHeader(header.toLowerCase());
      }
    };
    setRequestHeader("X-Client-Name");
    setRequestHeader("X-Client-Version");
    setRequestHeader("X-Machine-Id");
    setRequestHeader("X-Client-Commit");
    const context = await this._requestService.request(
      {
        type: "GET",
        url: uri.toString(true),
        headers
      },
      CancellationToken.None
    );
    const status = context.res.statusCode || 500;
    if (status !== 200) {
      let text = null;
      try {
        text = await asTextOrError(context);
      } catch (error) {
      }
      return serveError(
        req,
        res,
        status,
        text || `Request failed with status ${status}`
      );
    }
    const responseHeaders = /* @__PURE__ */ Object.create(null);
    const setResponseHeader = (header) => {
      const value = context.res.headers[header];
      if (value) {
        responseHeaders[header] = value;
      } else if (header !== header.toLowerCase()) {
        setResponseHeader(header.toLowerCase());
      }
    };
    setResponseHeader("Cache-Control");
    setResponseHeader("Content-Type");
    res.writeHead(200, responseHeaders);
    const buffer = await streamToBuffer(context.stream);
    return void res.end(buffer.buffer);
  }
  /**
   * Handle HTTP requests for /
   */
  async _handleRoot(req, res, parsedUrl) {
    const queryConnectionToken = parsedUrl.query[connectionTokenQueryName];
    if (typeof queryConnectionToken === "string") {
      const responseHeaders = /* @__PURE__ */ Object.create(null);
      responseHeaders["Set-Cookie"] = cookie.serialize(
        connectionTokenCookieName,
        queryConnectionToken,
        {
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7
        }
      );
      const newQuery = /* @__PURE__ */ Object.create(null);
      for (const key in parsedUrl.query) {
        if (key !== connectionTokenQueryName) {
          newQuery[key] = parsedUrl.query[key];
        }
      }
      const newLocation = url.format({
        pathname: parsedUrl.pathname,
        query: newQuery
      });
      responseHeaders["Location"] = newLocation;
      res.writeHead(302, responseHeaders);
      return void res.end();
    }
    const getFirstHeader = (headerName) => {
      const val = req.headers[headerName];
      return Array.isArray(val) ? val[0] : val;
    };
    const useTestResolver = !this._environmentService.isBuilt && this._environmentService.args["use-test-resolver"];
    const remoteAuthority = useTestResolver ? "test+test" : getFirstHeader("x-original-host") || getFirstHeader("x-forwarded-host") || req.headers.host;
    if (!remoteAuthority) {
      return serveError(req, res, 400, `Bad request.`);
    }
    function asJSON(value) {
      return JSON.stringify(value).replace(/"/g, "&quot;");
    }
    let _wrapWebWorkerExtHostInIframe;
    if (this._environmentService.args["enable-smoke-test-driver"]) {
      _wrapWebWorkerExtHostInIframe = false;
    }
    const resolveWorkspaceURI = (defaultLocation) => defaultLocation && URI.file(path.resolve(defaultLocation)).with({
      scheme: Schemas.vscodeRemote,
      authority: remoteAuthority
    });
    const filePath = FileAccess.asFileUri(
      `vs/code/browser/workbench/workbench${this._environmentService.isBuilt ? "" : "-dev"}.${isESM ? "esm." : ""}html`
    ).fsPath;
    const authSessionInfo = !this._environmentService.isBuilt && this._environmentService.args["github-auth"] ? {
      id: generateUuid(),
      providerId: "github",
      accessToken: this._environmentService.args["github-auth"],
      scopes: [["user:email"], ["repo"]]
    } : void 0;
    const productConfiguration = {
      embedderIdentifier: "server-distro",
      extensionsGallery: this._webExtensionResourceUrlTemplate && this._productService.extensionsGallery ? {
        ...this._productService.extensionsGallery,
        resourceUrlTemplate: this._webExtensionResourceUrlTemplate.with({
          scheme: "http",
          authority: remoteAuthority,
          path: `${this._webExtensionRoute}/${this._webExtensionResourceUrlTemplate.authority}${this._webExtensionResourceUrlTemplate.path}`
        }).toString(true)
      } : void 0
    };
    if (!this._environmentService.isBuilt) {
      try {
        const productOverrides = JSON.parse(
          (await promises.readFile(
            join(APP_ROOT, "product.overrides.json")
          )).toString()
        );
        Object.assign(productConfiguration, productOverrides);
      } catch (err) {
      }
    }
    const workbenchWebConfiguration = {
      remoteAuthority,
      serverBasePath: this._basePath,
      _wrapWebWorkerExtHostInIframe,
      developmentOptions: {
        enableSmokeTestDriver: this._environmentService.args["enable-smoke-test-driver"] ? true : void 0,
        logLevel: this._logService.getLevel()
      },
      settingsSyncOptions: !this._environmentService.isBuilt && this._environmentService.args["enable-sync"] ? { enabled: true } : void 0,
      enableWorkspaceTrust: !this._environmentService.args["disable-workspace-trust"],
      folderUri: resolveWorkspaceURI(
        this._environmentService.args["default-folder"]
      ),
      workspaceUri: resolveWorkspaceURI(
        this._environmentService.args["default-workspace"]
      ),
      productConfiguration,
      callbackRoute: this._callbackRoute
    };
    const cookies = cookie.parse(req.headers.cookie || "");
    const locale = cookies["vscode.nls.locale"] || req.headers["accept-language"]?.split(",")[0]?.toLowerCase() || "en";
    let WORKBENCH_NLS_BASE_URL;
    let WORKBENCH_NLS_URL;
    if (!locale.startsWith("en") && this._productService.nlsCoreBaseUrl) {
      WORKBENCH_NLS_BASE_URL = this._productService.nlsCoreBaseUrl;
      WORKBENCH_NLS_URL = `${WORKBENCH_NLS_BASE_URL}${this._productService.commit}/${this._productService.version}/${locale}/nls.messages.js`;
    } else {
      WORKBENCH_NLS_URL = "";
    }
    const values = {
      WORKBENCH_WEB_CONFIGURATION: asJSON(workbenchWebConfiguration),
      WORKBENCH_AUTH_SESSION: authSessionInfo ? asJSON(authSessionInfo) : "",
      WORKBENCH_WEB_BASE_URL: this._staticRoute,
      WORKBENCH_NLS_URL,
      WORKBENCH_NLS_FALLBACK_URL: `${this._staticRoute}/out/nls.messages.js`
    };
    if (this._cssDevService.isEnabled) {
      const cssModules = await this._cssDevService.getCssModules();
      values["WORKBENCH_DEV_CSS_MODULES"] = JSON.stringify(cssModules);
    }
    if (useTestResolver) {
      const bundledExtensions = [];
      for (const extensionPath of [
        "vscode-test-resolver",
        "github-authentication"
      ]) {
        const packageJSON = JSON.parse(
          (await promises.readFile(
            FileAccess.asFileUri(
              `${builtinExtensionsPath}/${extensionPath}/package.json`
            ).fsPath
          )).toString()
        );
        bundledExtensions.push({ extensionPath, packageJSON });
      }
      values["WORKBENCH_BUILTIN_EXTENSIONS"] = asJSON(bundledExtensions);
    }
    let data;
    try {
      const workbenchTemplate = (await promises.readFile(filePath)).toString();
      data = workbenchTemplate.replace(
        /\{\{([^}]+)\}\}/g,
        (_, key) => values[key] ?? "undefined"
      );
    } catch (e) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return void res.end("Not found");
    }
    const webWorkerExtensionHostIframeScriptSHA = isESM ? "sha256-2Q+j4hfT09+1+imS46J2YlkCtHWQt0/BE79PXjJ0ZJ8=" : "sha256-V28GQnL3aYxbwgpV3yW1oJ+VKKe/PBSzWntNyH8zVXA=";
    const cspDirectives = [
      "default-src 'self';",
      "img-src 'self' https: data: blob:;",
      "media-src 'self';",
      isESM ? `script-src 'self' 'unsafe-eval' ${WORKBENCH_NLS_BASE_URL ?? ""} blob: 'nonce-1nline-m4p' ${this._getScriptCspHashes(data).join(" ")} '${webWorkerExtensionHostIframeScriptSHA}' 'sha256-/r7rqQ+yrxt57sxLuQ6AMYcy/lUpvAIzHjIJt/OeLWU=' ${useTestResolver ? "" : `http://${remoteAuthority}`};` : (
        // the sha is the same as in src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.esm.html
        `script-src 'self' 'unsafe-eval' ${WORKBENCH_NLS_BASE_URL ?? ""} ${this._getScriptCspHashes(data).join(" ")} '${webWorkerExtensionHostIframeScriptSHA}' ${useTestResolver ? "" : `http://${remoteAuthority}`};`
      ),
      // the sha is the same as in src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html
      "child-src 'self';",
      `frame-src 'self' https://*.vscode-cdn.net data:;`,
      "worker-src 'self' data: blob:;",
      "style-src 'self' 'unsafe-inline';",
      "connect-src 'self' ws: wss: https:;",
      "font-src 'self' blob:;",
      "manifest-src 'self';"
    ].join(" ");
    const headers = {
      "Content-Type": "text/html",
      "Content-Security-Policy": cspDirectives
    };
    if (this._connectionToken.type !== ServerConnectionTokenType.None) {
      headers["Set-Cookie"] = cookie.serialize(
        connectionTokenCookieName,
        this._connectionToken.value,
        {
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7
        }
      );
    }
    res.writeHead(200, headers);
    return void res.end(data);
  }
  _getScriptCspHashes(content) {
    const regex = /<script>([\s\S]+?)<\/script>/gim;
    const result = [];
    let match;
    while (match = regex.exec(content)) {
      const hasher = crypto.createHash("sha256");
      const script = match[1].replace(/\r\n/g, "\n");
      const hash = hasher.update(Buffer.from(script)).digest().toString("base64");
      result.push(`'sha256-${hash}'`);
    }
    return result;
  }
  /**
   * Handle HTTP requests for /callback
   */
  async _handleCallback(res) {
    const filePath = FileAccess.asFileUri(
      "vs/code/browser/workbench/callback.html"
    ).fsPath;
    const data = (await promises.readFile(filePath)).toString();
    const cspDirectives = [
      "default-src 'self';",
      "img-src 'self' https: data: blob:;",
      "media-src 'none';",
      `script-src 'self' ${this._getScriptCspHashes(data).join(" ")};`,
      "style-src 'self' 'unsafe-inline';",
      "font-src 'self' blob:;"
    ].join(" ");
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Security-Policy": cspDirectives
    });
    return void res.end(data);
  }
};
WebClientServer = __decorateClass([
  __decorateParam(3, IServerEnvironmentService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IRequestService),
  __decorateParam(6, IProductService),
  __decorateParam(7, ICSSDevelopmentService)
], WebClientServer);
export {
  CacheControl,
  WebClientServer,
  serveError,
  serveFile
};
