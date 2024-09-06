import{streamToBuffer as u}from"../../../../vs/base/common/buffer.js";import"../../../../vs/base/common/cancellation.js";import{getErrorMessage as c}from"../../../../vs/base/common/errors.js";import{Disposable as f}from"../../../../vs/base/common/lifecycle.js";import"../../../../vs/base/parts/request/common/request.js";import{localize as t}from"../../../../vs/nls.js";import{ConfigurationScope as h,Extensions as g}from"../../../../vs/platform/configuration/common/configurationRegistry.js";import{createDecorator as m}from"../../../../vs/platform/instantiation/common/instantiation.js";import{CONTEXT_LOG_LEVEL as y,LogLevel as x,LogLevelToString as C}from"../../../../vs/platform/log/common/log.js";import{Registry as b}from"../../../../vs/platform/registry/common/platform.js";const B=m("requestService");class S{constructor(o){this.original=o}headers;toJSON(){if(!this.headers){const o=Object.create(null);for(const r in this.original)r.toLowerCase()==="authorization"||r.toLowerCase()==="proxy-authorization"?o[r]="*****":o[r]=this.original[r];this.headers=o}return this.headers}}class J extends f{logger;counter=0;constructor(o){super(),this.logger=o.createLogger("network",{name:t("request","Network Requests"),when:y.isEqualTo(C(x.Trace)).serialize()})}async logAndRequest(o,r,i){const n=`${o} #${++this.counter}: ${r.url}`;this.logger.trace(`${n} - begin`,r.type,new S(r.headers??{}));try{const s=await i();return this.logger.trace(`${n} - end`,r.type,s.res.statusCode,s.res.headers),s}catch(s){throw this.logger.error(`${n} - error`,r.type,c(s)),s}}}function p(e){return e.res.statusCode&&e.res.statusCode>=200&&e.res.statusCode<300||e.res.statusCode===1223}function d(e){return e.res.statusCode===204}async function I(e){return d(e)?null:(await u(e.stream)).toString()}async function V(e){if(!p(e))throw new Error("Server returned "+e.res.statusCode);return I(e)}async function j(e){if(!p(e))throw new Error("Server returned "+e.res.statusCode);if(d(e))return null;const r=(await u(e.stream)).toString();try{return JSON.parse(r)}catch(i){throw i.message+=`:
`+r,i}}function F(e){l(e)}let a;function l(e){const o=b.as(g.Configuration),r=a;a={id:"http",order:15,title:t("httpConfigurationTitle","HTTP"),type:"object",scope:e,properties:{"http.proxy":{type:"string",pattern:"^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$",markdownDescription:t("proxy","The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),restricted:!0},"http.proxyStrictSSL":{type:"boolean",default:!0,description:t("strictSSL","Controls whether the proxy server certificate should be verified against the list of supplied CAs."),restricted:!0},"http.proxyKerberosServicePrincipal":{type:"string",markdownDescription:t("proxyKerberosServicePrincipal","Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set."),restricted:!0},"http.noProxy":{type:"array",items:{type:"string"},markdownDescription:t("noProxy","Specifies domain names for which proxy settings should be ignored for HTTP/HTTPS requests."),restricted:!0},"http.proxyAuthorization":{type:["null","string"],default:null,markdownDescription:t("proxyAuthorization","The value to send as the `Proxy-Authorization` header for every network request."),restricted:!0},"http.proxySupport":{type:"string",enum:["off","on","fallback","override"],enumDescriptions:[t("proxySupportOff","Disable proxy support for extensions."),t("proxySupportOn","Enable proxy support for extensions."),t("proxySupportFallback","Enable proxy support for extensions, fall back to request options, when no proxy found."),t("proxySupportOverride","Enable proxy support for extensions, override request options.")],default:"override",description:t("proxySupport","Use the proxy support for extensions."),restricted:!0},"http.systemCertificates":{type:"boolean",default:!0,description:t("systemCertificates","Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),restricted:!0},"http.experimental.systemCertificatesV2":{type:"boolean",tags:["experimental"],default:!1,description:t("systemCertificatesV2","Controls whether experimental loading of CA certificates from the OS should be enabled. This uses a more general approach than the default implemenation."),restricted:!0}}},o.updateConfigurations({add:[a],remove:r?[r]:[]})}l(h.APPLICATION);export{J as AbstractRequestService,B as IRequestService,j as asJson,I as asText,V as asTextOrError,d as hasNoContent,p as isSuccess,F as updateProxyConfigurationsScope};