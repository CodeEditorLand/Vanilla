var y=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var d=(o,e,n,i)=>{for(var t=i>1?void 0:i?w(e,n):e,r=o.length-1,l;r>=0;r--)(l=o[r])&&(t=(i?l(e,n,t):l(t))||t);return i&&t&&y(e,n,t),t},v=(o,e)=>(n,i)=>e(n,i,o);import{equals as p}from"../../../../base/common/arrays.js";import{isEqual as b}from"../../../../base/common/resources.js";import{generateUuid as g}from"../../../../base/common/uuid.js";import{RawContextKey as c}from"../../../../platform/contextkey/common/contextkey.js";import{createDecorator as I}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as m,StorageScope as f,StorageTarget as u}from"../../../../platform/storage/common/storage.js";import{Memento as W}from"../../../common/memento.js";const z=new c("webviewFindWidgetVisible",!1),Q=new c("webviewFindWidgetFocused",!1),Z=new c("webviewFindWidgetEnabled",!1),$=I("webviewService");var E=(i=>(i.NotebookRenderer="notebookRenderer",i.CustomEditor="customEditor",i.WebviewView="webviewView",i))(E||{});function ee(o,e){return o.allowMultipleAPIAcquire===e.allowMultipleAPIAcquire&&o.allowScripts===e.allowScripts&&o.allowForms===e.allowForms&&p(o.localResourceRoots,e.localResourceRoots,b)&&p(o.portMapping,e.portMapping,(n,i)=>n.extensionHostPort===i.extensionHostPort&&n.webviewPort===i.webviewPort)&&x(o,e)}function x(o,e){return o.enableCommandUris===e.enableCommandUris?!0:Array.isArray(o.enableCommandUris)&&Array.isArray(e.enableCommandUris)?p(o.enableCommandUris,e.enableCommandUris):!1}let a=class{_memento;_state;constructor(e,n){this._memento=new W(e,n),this._state=this._memento.getMemento(f.APPLICATION,u.MACHINE)}getOrigin(e,n){const i=this._getKey(e,n),t=this._state[i];if(t&&typeof t=="string")return t;const r=g();return this._state[i]=r,this._memento.saveMemento(),r}_getKey(e,n){return JSON.stringify({viewType:e,key:n})}};a=d([v(1,m)],a);let s=class{_store;constructor(e,n){this._store=new a(e,n)}getOrigin(e,n){return this._store.getOrigin(e,n.value)}};s=d([v(1,m)],s);export{s as ExtensionKeyedWebviewOriginStore,$ as IWebviewService,Z as KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED,Q as KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED,z as KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE,E as WebviewContentPurpose,a as WebviewOriginStore,ee as areWebviewContentOptionsEqual};
