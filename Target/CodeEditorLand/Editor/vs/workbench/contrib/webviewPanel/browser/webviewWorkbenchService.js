var I=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var d=(v,t,e,i)=>{for(var r=i>1?void 0:i?f(t,e):t,o=v.length-1,n;o>=0;o--)(n=v[o])&&(r=(i?n(t,e,r):n(r))||r);return i&&r&&I(t,e,r),r},p=(v,t)=>(e,i)=>t(e,i,v);import{DeferredPromise as W,createCancelablePromise as m}from"../../../../base/common/async.js";import{CancellationTokenSource as _}from"../../../../base/common/cancellation.js";import{memoize as h}from"../../../../base/common/decorators.js";import{isCancellationError as y}from"../../../../base/common/errors.js";import{Emitter as g}from"../../../../base/common/event.js";import{Iterable as E}from"../../../../base/common/iterator.js";import{Disposable as P,combinedDisposable as R,toDisposable as S}from"../../../../base/common/lifecycle.js";import{EditorActivation as u}from"../../../../platform/editor/common/editor.js";import{IInstantiationService as T,createDecorator as C}from"../../../../platform/instantiation/common/instantiation.js";import{DiffEditorInput as b}from"../../../common/editor/diffEditorInput.js";import{IEditorGroupsService as D}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as A}from"../../../services/editor/common/editorService.js";import{IWebviewService as G}from"../../webview/browser/webview.js";import{CONTEXT_ACTIVE_WEBVIEW_PANEL_ID as O}from"./webviewEditor.js";import{WebviewInput as a}from"./webviewEditorInput.js";import{WebviewIconManager as k}from"./webviewIconManager.js";const V=C("webviewEditorService");function l(v,t){return v.canResolve(t)}let c=class extends a{constructor(e,i,r){super(e,i,r.iconManager);this._webviewWorkbenchService=r}_resolved=!1;_resolvePromise;dispose(){super.dispose(),this._resolvePromise?.cancel(),this._resolvePromise=void 0}async resolve(){if(!this._resolved){this._resolved=!0,this._resolvePromise=m(e=>this._webviewWorkbenchService.resolveWebview(this,e));try{await this._resolvePromise}catch(e){if(!y(e))throw e}}return super.resolve()}transfer(e){if(super.transfer(e))return e._resolved=this._resolved,e}};d([h],c.prototype,"resolve",1),c=d([p(2,V)],c);class x{_awaitingRevival=[];enqueueForRestoration(t,e){const i=new W,r=()=>{const n=this._awaitingRevival.findIndex(s=>t===s.input);n>=0&&this._awaitingRevival.splice(n,1)},o=R(t.webview.onDidDispose(r),e.onCancellationRequested(()=>{r(),i.cancel()}));return this._awaitingRevival.push({input:t,promise:i,disposable:o}),i.p}reviveFor(t,e){const i=this._awaitingRevival.filter(({input:r})=>l(t,r));this._awaitingRevival=this._awaitingRevival.filter(({input:r})=>!l(t,r));for(const{input:r,promise:o,disposable:n}of i)t.resolveWebview(r,e).then(s=>o.complete(s),s=>o.error(s)).finally(()=>{n.dispose()})}}let w=class extends P{constructor(e,i,r,o){super();this._editorService=i;this._instantiationService=r;this._webviewService=o;this._iconManager=this._register(this._instantiationService.createInstance(k)),this._register(e.registerContextKeyProvider({contextKey:O,getGroupContextKeyValue:n=>this.getWebviewId(n.activeEditor)})),this._register(i.onDidActiveEditorChange(()=>{this.updateActiveWebview()})),this._register(o.onDidChangeActiveWebview(()=>{this.updateActiveWebview()})),this.updateActiveWebview()}_revivers=new Set;_revivalPool=new x;_iconManager;get iconManager(){return this._iconManager}_activeWebview;_onDidChangeActiveWebviewEditor=this._register(new g);onDidChangeActiveWebviewEditor=this._onDidChangeActiveWebviewEditor.event;getWebviewId(e){let i;return e instanceof a?i=e:e instanceof b&&(e.primary instanceof a?i=e.primary:e.secondary instanceof a&&(i=e.secondary)),i?.webview.providedViewType??""}updateActiveWebview(){const e=this._editorService.activeEditor;let i;e instanceof a?i=e:e instanceof b&&(e.primary instanceof a&&e.primary.webview===this._webviewService.activeWebview?i=e.primary:e.secondary instanceof a&&e.secondary.webview===this._webviewService.activeWebview&&(i=e.secondary)),i!==this._activeWebview&&(this._activeWebview=i,this._onDidChangeActiveWebviewEditor.fire(i))}openWebview(e,i,r,o){const n=this._webviewService.createWebviewOverlay(e),s=this._instantiationService.createInstance(a,{viewType:i,name:r,providedId:e.providedViewType},n,this.iconManager);return this._editorService.openEditor(s,{pinned:!0,preserveFocus:o.preserveFocus,activation:o.preserveFocus?u.RESTORE:void 0},o.group),s}revealWebview(e,i,r){const o=this.findTopLevelEditorForWebview(e);this._editorService.openEditor(o,{preserveFocus:r,activation:r?u.RESTORE:void 0},i)}findTopLevelEditorForWebview(e){for(const i of this._editorService.editors)if(i===e||i instanceof b&&(e===i.primary||e===i.secondary))return i;return e}openRevivedWebview(e){const i=this._webviewService.createWebviewOverlay(e.webviewInitInfo);i.state=e.state;const r=this._instantiationService.createInstance(c,{viewType:e.viewType,providedId:e.webviewInitInfo.providedViewType,name:e.title},i);return r.iconPath=e.iconPath,typeof e.group=="number"&&r.updateGroup(e.group),r}registerResolver(e){this._revivers.add(e);const i=new _;return this._revivalPool.reviveFor(e,i.token),S(()=>{this._revivers.delete(e),i.dispose(!0)})}shouldPersist(e){return e instanceof c?!0:E.some(this._revivers.values(),i=>l(i,e))}async tryRevive(e,i){for(const r of this._revivers.values())if(l(r,e))return await r.resolveWebview(e,i),!0;return!1}async resolveWebview(e,i){if(!await this.tryRevive(e,i)&&!i.isCancellationRequested)return this._revivalPool.enqueueForRestoration(e,i)}setIcons(e,i){this._iconManager.setIcons(e,i)}};w=d([p(0,D),p(1,A),p(2,T),p(3,G)],w);export{V as IWebviewWorkbenchService,c as LazilyResolvedWebviewEditorInput,w as WebviewEditorService};
