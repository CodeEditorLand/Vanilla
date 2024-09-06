import{streamToBuffer as u}from"../../../base/common/buffer.js";import"../../../base/common/cancellation.js";import{getErrorMessage as l}from"../../../base/common/errors.js";import{Disposable as c}from"../../../base/common/lifecycle.js";import"../../../base/parts/request/common/request.js";import{localize as t}from"../../../nls.js";import{ConfigurationScope as h,Extensions as g}from"../../configuration/common/configurationRegistry.js";import{createDecorator as m}from"../../instantiation/common/instantiation.js";import"../../log/common/log.js";import{Registry as y}from"../../registry/common/platform.js";const $=m("requestService");class x{constructor(o){this.original=o}headers;toJSON(){if(!this.headers){const o=Object.create(null);for(const r in this.original)r.toLowerCase()==="authorization"||r.toLowerCase()==="proxy-authorization"?o[r]="*****":o[r]=this.original[r];this.headers=o}return this.headers}}class N extends c{constructor(r){super();this.logger=r}counter=0;async logAndRequest(r,i){const n=`#${++this.counter}: ${r.url}`;this.logger.info(`${n} - begin`,r.type,new x(r.headers??{}));try{const s=await i();return this.logger.info(`${n} - end`,r.type,s.res.statusCode,s.res.headers),s}catch(s){throw this.logger.error(`${n} - error`,r.type,l(s)),s}}}function p(e){return e.res.statusCode&&e.res.statusCode>=200&&e.res.statusCode<300||e.res.statusCode===1223}function d(e){return e.res.statusCode===204}async function C(e){return d(e)?null:(await u(e.stream)).toString()}async function K(e){if(!p(e))throw new Error("Server returned "+e.res.statusCode);return C(e)}async function _(e){if(!p(e))throw new Error("Server returned "+e.res.statusCode);if(d(e))return null;const r=(await u(e.stream)).toString();try{return JSON.parse(r)}catch(i){throw i.message+=`:
`+r,i}}function B(e){f(e)}let a;function f(e){const o=y.as(g.Configuration),r=a;a={id:"http",order:15,title:t("httpConfigurationTitle","HTTP"),type:"object",scope:e,properties:{"http.proxy":{type:"string",pattern:"^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$",markdownDescription:t("proxy","The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),restricted:!0},"http.proxyStrictSSL":{type:"boolean",default:!0,description:t("strictSSL","Controls whether the proxy server certificate should be verified against the list of supplied CAs."),restricted:!0},"http.proxyKerberosServicePrincipal":{type:"string",markdownDescription:t("proxyKerberosServicePrincipal","Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set."),restricted:!0},"http.noProxy":{type:"array",items:{type:"string"},markdownDescription:t("noProxy","Specifies domain names for which proxy settings should be ignored for HTTP/HTTPS requests."),restricted:!0},"http.proxyAuthorization":{type:["null","string"],default:null,markdownDescription:t("proxyAuthorization","The value to send as the `Proxy-Authorization` header for every network request."),restricted:!0},"http.proxySupport":{type:"string",enum:["off","on","fallback","override"],enumDescriptions:[t("proxySupportOff","Disable proxy support for extensions."),t("proxySupportOn","Enable proxy support for extensions."),t("proxySupportFallback","Enable proxy support for extensions, fall back to request options, when no proxy found."),t("proxySupportOverride","Enable proxy support for extensions, override request options.")],default:"override",description:t("proxySupport","Use the proxy support for extensions."),restricted:!0},"http.systemCertificates":{type:"boolean",default:!0,description:t("systemCertificates","Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),restricted:!0},"http.experimental.systemCertificatesV2":{type:"boolean",tags:["experimental"],default:!1,description:t("systemCertificatesV2","Controls whether experimental loading of CA certificates from the OS should be enabled. This uses a more general approach than the default implemenation."),restricted:!0}}},o.updateConfigurations({add:[a],remove:r?[r]:[]})}f(h.APPLICATION);export{N as AbstractRequestService,$ as IRequestService,_ as asJson,C as asText,K as asTextOrError,d as hasNoContent,p as isSuccess,B as updateProxyConfigurationsScope};
