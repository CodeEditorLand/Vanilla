var g=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var c=(w,r,i,e)=>{for(var t=e>1?void 0:e?m(r,i):r,s=w.length-1,a;s>=0;s--)(a=w[s])&&(t=(e?a(r,i,t):a(t))||t);return e&&t&&g(r,i,t),t},l=(w,r)=>(i,e)=>r(i,e,w);import"../../../base/common/cancellation.js";import{onUnexpectedError as W}from"../../../base/common/errors.js";import{Disposable as x,DisposableMap as p}from"../../../base/common/lifecycle.js";import{generateUuid as V}from"../../../base/common/uuid.js";import{reviveWebviewExtension as f}from"./mainThreadWebviews.js";import*as u from"../common/extHost.protocol.js";import"../../common/views.js";import{IWebviewViewService as y}from"../../contrib/webviewView/browser/webviewViewService.js";import{ITelemetryService as _}from"../../../platform/telemetry/common/telemetry.js";import"../../services/extensions/common/extHostCustomers.js";let d=class extends x{constructor(i,e,t,s){super();this.mainThreadWebviews=e;this._telemetryService=t;this._webviewViewService=s;this._proxy=i.getProxy(u.ExtHostContext.ExtHostWebviewViews)}_proxy;_webviewViews=this._register(new p);_webviewViewProviders=this._register(new p);$setWebviewViewTitle(i,e){const t=this.getWebviewView(i);t.title=e}$setWebviewViewDescription(i,e){const t=this.getWebviewView(i);t.description=e}$setWebviewViewBadge(i,e){const t=this.getWebviewView(i);t.badge=e}$show(i,e){this.getWebviewView(i).show(e)}$registerWebviewViewProvider(i,e,t){if(this._webviewViewProviders.has(e))throw new Error(`View provider for ${e} already registered`);const s=f(i),a=this._webviewViewService.register(e,{resolve:async(o,h)=>{const n=V();this._webviewViews.set(n,o),this.mainThreadWebviews.addWebview(n,o.webview,{serializeBuffersForPostMessage:t.serializeBuffersForPostMessage});let b;if(o.webview.state)try{b=JSON.parse(o.webview.state)}catch(v){console.error("Could not load webview state",v,o.webview.state)}o.webview.extension=s,t&&(o.webview.options=t),o.onDidChangeVisibility(v=>{this._proxy.$onDidChangeWebviewViewVisibility(n,v)}),o.onDispose(()=>{this._proxy.$disposeWebviewView(n),this._webviewViews.deleteAndDispose(n)}),this._telemetryService.publicLog2("webviews:createWebviewView",{extensionId:s.id.value,id:e});try{await this._proxy.$resolveWebviewView(n,e,o.title,b,h)}catch(v){W(v),o.webview.setHtml(this.mainThreadWebviews.getWebviewResolvedFailedContent(e))}}});this._webviewViewProviders.set(e,a)}$unregisterWebviewViewProvider(i){if(!this._webviewViewProviders.has(i))throw new Error(`No view provider for ${i} registered`);this._webviewViewProviders.deleteAndDispose(i)}getWebviewView(i){const e=this._webviewViews.get(i);if(!e)throw new Error("unknown webview view");return e}};d=c([l(2,_),l(3,y)],d);export{d as MainThreadWebviewsViews};
