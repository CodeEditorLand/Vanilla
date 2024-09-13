import{toDisposable as c}from"../../../base/common/lifecycle.js";import{Schemas as i}from"../../../base/common/network.js";import{URI as s}from"../../../base/common/uri.js";import{MainContext as m}from"./extHost.protocol.js";class p{static supportedSchemes=new Set([i.http,i.https]);_proxy;_openers=new Map;constructor(r){this._proxy=r.getProxy(m.MainThreadUriOpeners)}registerExternalUriOpener(r,e,o,n){if(this._openers.has(e))throw new Error(`Opener with id '${e}' already registered`);const t=n.schemes.find(a=>!p.supportedSchemes.has(a));if(t)throw new Error(`Scheme '${t}' is not supported. Only http and https are currently supported.`);return this._openers.set(e,o),this._proxy.$registerUriOpener(e,n.schemes,r,n.label),c(()=>{this._openers.delete(e),this._proxy.$unregisterUriOpener(e)})}async $canOpenUri(r,e,o){const n=this._openers.get(r);if(!n)throw new Error(`Unknown opener with id: ${r}`);const t=s.revive(e);return n.canOpenExternalUri(t,o)}async $openUri(r,e,o){const n=this._openers.get(r);if(!n)throw new Error(`Unknown opener id: '${r}'`);return n.openExternalUri(s.revive(e.resolvedUri),{sourceUri:s.revive(e.sourceUri)},o)}}export{p as ExtHostUriOpeners};
