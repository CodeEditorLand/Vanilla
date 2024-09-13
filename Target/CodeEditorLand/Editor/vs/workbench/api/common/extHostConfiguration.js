var R=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var P=(r,e,t,o)=>{for(var n=o>1?void 0:o?$(e,t):e,a=r.length-1,d;a>=0;a--)(d=r[a])&&(n=(o?d(e,t,n):d(n))||n);return o&&n&&R(e,t,n),n},E=(r,e)=>(t,o)=>e(t,o,r);import{Barrier as O}from"../../../base/common/async.js";import{Emitter as V}from"../../../base/common/event.js";import{deepClone as g,mixin as D}from"../../../base/common/objects.js";import{isObject as W}from"../../../base/common/types.js";import{URI as S}from"../../../base/common/uri.js";import{ConfigurationTarget as v}from"../../../platform/configuration/common/configuration.js";import{Configuration as H,ConfigurationChangeEvent as L}from"../../../platform/configuration/common/configurationModels.js";import{ConfigurationScope as w,OVERRIDE_PROPERTY_REGEX as j}from"../../../platform/configuration/common/configurationRegistry.js";import{createDecorator as M}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as K}from"../../../platform/log/common/log.js";import{MainContext as A}from"./extHost.protocol.js";import{IExtHostRpcService as F}from"./extHostRpcService.js";import{ConfigurationTarget as T}from"./extHostTypes.js";import{IExtHostWorkspace as U}from"./extHostWorkspace.js";function h(r,e){if(e){const t=e.split(".");let o=r;for(let n=0;o&&n<t.length;n++)o=o[t[n]];return o}}function z(r){return r instanceof S}function B(r){return r&&r.uri instanceof S&&r.languageId&&typeof r.languageId=="string"}function G(r){return r&&!r.uri&&r.languageId&&typeof r.languageId=="string"}function N(r){return r&&r.uri instanceof S&&(!r.name||typeof r.name=="string")&&(!r.index||typeof r.index=="number")}function b(r){if(z(r))return{resource:r};if(B(r))return{resource:r.uri,overrideIdentifier:r.languageId};if(G(r))return{overrideIdentifier:r.languageId};if(N(r))return{resource:r.uri};if(r===null)return{resource:null}}let I=class{_serviceBrand;_proxy;_logService;_extHostWorkspace;_barrier;_actual;constructor(e,t,o){this._proxy=e.getProxy(A.MainThreadConfiguration),this._extHostWorkspace=t,this._logService=o,this._barrier=new O,this._actual=null}getConfigProvider(){return this._barrier.wait().then(e=>this._actual)}$initializeConfiguration(e){this._actual=new X(this._proxy,this._extHostWorkspace,e,this._logService),this._barrier.open()}$acceptConfigurationChanged(e,t){this.getConfigProvider().then(o=>o.$acceptConfigurationChanged(e,t))}};I=P([E(0,F),E(1,U),E(2,K)],I);class X{_onDidChangeConfiguration=new V;_proxy;_extHostWorkspace;_configurationScopes;_configuration;_logService;constructor(e,t,o,n){this._proxy=e,this._logService=n,this._extHostWorkspace=t,this._configuration=H.parse(o,n),this._configurationScopes=this._toMap(o.configurationScopes)}get onDidChangeConfiguration(){return this._onDidChangeConfiguration&&this._onDidChangeConfiguration.event}$acceptConfigurationChanged(e,t){const o={data:this._configuration.toData(),workspace:this._extHostWorkspace.workspace};this._configuration=H.parse(e,this._logService),this._configurationScopes=this._toMap(e.configurationScopes),this._onDidChangeConfiguration.fire(this._toConfigurationChangeEvent(t,o))}getConfiguration(e,t,o){const n=b(t)||{},a=this._toReadonlyValue(e?h(this._configuration.getValue(void 0,n,this._extHostWorkspace.workspace),e):this._configuration.getValue(void 0,n,this._extHostWorkspace.workspace));e&&this._validateConfigurationAccess(e,n,o?.identifier);function d(i){if(i==null)return null;if(typeof i=="boolean")return i?v.USER:v.WORKSPACE;switch(i){case T.Global:return v.USER;case T.Workspace:return v.WORKSPACE;case T.WorkspaceFolder:return v.WORKSPACE_FOLDER}}const k={has(i){return typeof h(a,i)<"u"},get:(i,s)=>{this._validateConfigurationAccess(e?`${e}.${i}`:i,n,o?.identifier);let p=h(a,i);if(typeof p>"u")p=s;else{let c;const C=(y,m)=>{if(W(y)){let u;const _=()=>{c=c||g(a),u=u||h(c,m)};return new Proxy(y,{get:(x,f)=>{if(typeof f=="string"&&f.toLowerCase()==="tojson")return _(),()=>u;if(c)return u=u||h(c,m),u[f];const l=x[f];return typeof f=="string"?C(l,`${m}.${f}`):l},set:(x,f,l)=>(_(),u&&(u[f]=l),!0),deleteProperty:(x,f)=>(_(),u&&delete u[f],!0),defineProperty:(x,f,l)=>(_(),u&&Object.defineProperty(u,f,l),!0)})}return Array.isArray(y)?g(y):y};p=C(p,i)}return p},update:(i,s,p,c)=>{i=e?`${e}.${i}`:i;const C=d(p);return s!==void 0?this._proxy.$updateConfigurationOption(C,i,s,n,c):this._proxy.$removeConfigurationOption(C,i,n,c)},inspect:i=>{i=e?`${e}.${i}`:i;const s=this._configuration.inspect(i,n,this._extHostWorkspace.workspace);if(s)return{key:i,defaultValue:g(s.policy?.value??s.default?.value),globalValue:g(s.user?.value??s.application?.value),workspaceValue:g(s.workspace?.value),workspaceFolderValue:g(s.workspaceFolder?.value),defaultLanguageValue:g(s.default?.override),globalLanguageValue:g(s.user?.override??s.application?.override),workspaceLanguageValue:g(s.workspace?.override),workspaceFolderLanguageValue:g(s.workspaceFolder?.override),languageIds:g(s.overrideIdentifiers)}}};return typeof a=="object"&&D(k,a,!1),Object.freeze(k)}_toReadonlyValue(e){const t=o=>W(o)?new Proxy(o,{get:(n,a)=>t(n[a]),set:(n,a,d)=>{throw new Error(`TypeError: Cannot assign to read only property '${String(a)}' of object`)},deleteProperty:(n,a)=>{throw new Error(`TypeError: Cannot delete read only property '${String(a)}' of object`)},defineProperty:(n,a)=>{throw new Error(`TypeError: Cannot define property '${String(a)}' for a readonly object`)},setPrototypeOf:n=>{throw new Error("TypeError: Cannot set prototype for a readonly object")},isExtensible:()=>!1,preventExtensions:()=>!0}):o;return t(e)}_validateConfigurationAccess(e,t,o){const n=j.test(e)?w.RESOURCE:this._configurationScopes.get(e),a=o?`[${o.value}] `:"";if(w.RESOURCE===n){typeof t?.resource>"u"&&this._logService.warn(`${a}Accessing a resource scoped configuration without providing a resource is not expected. To get the effective value for '${e}', provide the URI of a resource or 'null' for any resource.`);return}if(w.WINDOW===n){t?.resource&&this._logService.warn(`${a}Accessing a window scoped configuration for a resource is not expected. To associate '${e}' to a resource, define its scope to 'resource' in configuration contributions in 'package.json'.`);return}}_toConfigurationChangeEvent(e,t){const o=new L(e,t,this._configuration,this._extHostWorkspace.workspace,this._logService);return Object.freeze({affectsConfiguration:(n,a)=>o.affectsConfiguration(n,b(a))})}_toMap(e){return e.reduce((t,o)=>(t.set(o[0],o[1]),t),new Map)}}const ge=M("IExtHostConfiguration");export{X as ExtHostConfigProvider,I as ExtHostConfiguration,ge as IExtHostConfiguration};
