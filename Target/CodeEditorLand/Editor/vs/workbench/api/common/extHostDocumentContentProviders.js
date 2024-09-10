import{onUnexpectedError as p}from"../../../base/common/errors.js";import{URI as u}from"../../../base/common/uri.js";import"../../../base/common/lifecycle.js";import{Disposable as f}from"./extHostTypes.js";import{MainContext as v}from"./extHost.protocol.js";import"./extHostDocumentsAndEditors.js";import{Schemas as h}from"../../../base/common/network.js";import"../../../platform/log/common/log.js";import{CancellationToken as l}from"../../../base/common/cancellation.js";import{splitLines as C}from"../../../base/common/strings.js";class c{constructor(e,o,t){this._documentsAndEditors=o;this._logService=t;this._proxy=e.getProxy(v.MainThreadDocumentContentProviders)}static _handlePool=0;_documentContentProviders=new Map;_proxy;registerTextDocumentContentProvider(e,o){if(Object.keys(h).indexOf(e)>=0)throw new Error(`scheme '${e}' already registered`);const t=c._handlePool++;this._documentContentProviders.set(t,o),this._proxy.$registerTextContentProvider(t,e);let i;if(typeof o.onDidChange=="function"){let r;i=o.onDidChange(async n=>{if(n.scheme!==e){this._logService.warn(`Provider for scheme '${e}' is firing event for schema '${n.scheme}' which will be IGNORED`);return}if(!this._documentsAndEditors.getDocument(n))return;r&&await r;const d=this.$provideTextDocumentContent(t,n).then(async s=>{if(!s&&typeof s!="string")return;const m=this._documentsAndEditors.getDocument(n);if(!m)return;const a=C(s);if(!m.equalLines(a))return this._proxy.$onVirtualDocumentChange(n,s)}).catch(p).finally(()=>{r===d&&(r=void 0)});r=d})}return new f(()=>{this._documentContentProviders.delete(t)&&this._proxy.$unregisterTextContentProvider(t),i&&(i.dispose(),i=void 0)})}$provideTextDocumentContent(e,o){const t=this._documentContentProviders.get(e);return t?Promise.resolve(t.provideTextDocumentContent(u.revive(o),l.None)):Promise.reject(new Error(`unsupported uri-scheme: ${o.scheme}`))}}export{c as ExtHostDocumentContentProvider};
