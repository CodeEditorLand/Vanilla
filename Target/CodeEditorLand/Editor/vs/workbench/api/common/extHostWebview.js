import{Emitter as w}from"../../../base/common/event.js";import{Disposable as x}from"../../../base/common/lifecycle.js";import{Schemas as c}from"../../../base/common/network.js";import*as W from"../../../base/common/objects.js";import{URI as b}from"../../../base/common/uri.js";import{normalizeVersion as m,parseVersion as u}from"../../../platform/extensions/common/extensionValidator.js";import{deserializeWebviewMessage as g,serializeWebviewMessage as H}from"./extHostWebviewMessaging.js";import{asWebviewUri as h,webviewGenericCspSource as f}from"../../contrib/webview/common/webview.js";import*as I from"./extHost.protocol.js";class E{#t;#o;#p;#l;#d;#e;#i="";#s;#r=!1;#n=!1;#v;#a;constructor(e,t,i,n,s,r,a){this.#t=e,this.#o=t,this.#s=i,this.#l=n,this.#d=s,this.#e=r,this.#v=y(r),this.#a=D(r),this.#p=a}_onMessageEmitter=new w;onDidReceiveMessage=this._onMessageEmitter.event;#c=new w;_onDidDispose=this.#c.event;dispose(){this.#r=!0,this.#c.fire(),this.#c.dispose(),this._onMessageEmitter.dispose()}asWebviewUri(e){return this.#n=!0,h(e,this.#l)}get cspSource(){const e=this.#e.extensionLocation;if(e.scheme===c.https||e.scheme===c.http){let t=e.toString();return t.endsWith("/")||(t+="/"),t+" "+f}return f}get html(){return this.assertNotDisposed(),this.#i}set html(e){this.assertNotDisposed(),this.#i!==e&&(this.#i=e,this.#a&&!this.#n&&/(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(e)&&(this.#n=!0,this.#p.report("Webview vscode-resource: uris",this.#e,"Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri")),this.#o.$setHtml(this.#t,this.rewriteOldResourceUrlsIfNeeded(e)))}get options(){return this.assertNotDisposed(),this.#s}set options(e){this.assertNotDisposed(),W.equals(this.#s,e)||this.#o.$setOptions(this.#t,S(this.#e,this.#d,e)),this.#s=e}async postMessage(e){if(this.#r)return!1;const t=H(e,{serializeBuffersForPostMessage:this.#v});return this.#o.$postMessage(this.#t,t.message,...t.buffers)}assertNotDisposed(){if(this.#r)throw new Error("Webview is disposed")}rewriteOldResourceUrlsIfNeeded(e){if(!this.#a)return e;const t=this.#e.extensionLocation?.scheme===c.vscodeRemote,i=this.#e.extensionLocation.scheme===c.vscodeRemote?this.#e.extensionLocation.authority:void 0;return e.replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi,(n,s,r,a,p,l)=>{const d=b.from({scheme:a||"file",path:decodeURIComponent(p)}),v=h(d,{isRemote:t,authority:i}).toString();return`${s}${v}${l}`}).replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi,(n,s,r,a,p,l)=>{const d=b.from({scheme:a||"file",path:decodeURIComponent(p)}),v=h(d,{isRemote:t,authority:i}).toString();return`${s}${v}${l}`})}}function y(o){try{const e=m(u(o.engines.vscode));return!!e&&e.majorBase>=1&&e.minorBase>=57}catch{return!1}}function D(o){try{const e=m(u(o.engines.vscode));return e?e.majorBase<1||e.majorBase===1&&e.minorBase<60:!1}catch{return!1}}class X extends x{constructor(t,i,n,s,r){super();this.remoteInfo=i;this.workspace=n;this._logService=s;this._deprecationService=r;this._webviewProxy=t.getProxy(I.MainContext.MainThreadWebviews)}_webviewProxy;_webviews=new Map;dispose(){super.dispose();for(const t of this._webviews.values())t.dispose();this._webviews.clear()}$onMessage(t,i,n){const s=this.getWebview(t);if(s){const{message:r}=g(i,n.value);s._onMessageEmitter.fire(r)}}$onMissingCsp(t,i){this._logService.warn(`${i} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`)}createNewWebview(t,i,n){const s=new E(t,this._webviewProxy,R(i),this.remoteInfo,this.workspace,n,this._deprecationService);this._webviews.set(t,s);const r=s._onDidDispose(()=>{r.dispose(),this.deleteWebview(t)});return s}deleteWebview(t){this._webviews.delete(t)}getWebview(t){return this._webviews.get(t)}}function Y(o){return{id:o.identifier,location:o.extensionLocation}}function S(o,e,t){return{enableCommandUris:t.enableCommandUris,enableScripts:t.enableScripts,enableForms:t.enableForms,portMapping:t.portMapping,localResourceRoots:t.localResourceRoots||M(o,e)}}function R(o){return{enableCommandUris:o.enableCommandUris,enableScripts:o.enableScripts,enableForms:o.enableForms,portMapping:o.portMapping,localResourceRoots:o.localResourceRoots?.map(e=>b.from(e))}}function M(o,e){return[...(e?.getWorkspaceFolders()||[]).map(t=>t.uri),o.extensionLocation]}export{E as ExtHostWebview,X as ExtHostWebviews,S as serializeWebviewOptions,y as shouldSerializeBuffersForPostMessage,Y as toExtensionData};
