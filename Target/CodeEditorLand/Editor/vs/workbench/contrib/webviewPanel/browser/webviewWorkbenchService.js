var I=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var p=(v,t,e,i)=>{for(var r=i>1?void 0:i?f(t,e):t,n=v.length-1,o;n>=0;n--)(o=v[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&I(t,e,r),r},d=(v,t)=>(e,i)=>t(e,i,v);import{createCancelablePromise as W,DeferredPromise as _}from"../../../../base/common/async.js";import{CancellationTokenSource as h}from"../../../../base/common/cancellation.js";import{memoize as m}from"../../../../base/common/decorators.js";import{isCancellationError as g}from"../../../../base/common/errors.js";import{Emitter as y}from"../../../../base/common/event.js";import{Iterable as E}from"../../../../base/common/iterator.js";import{combinedDisposable as P,Disposable as R,toDisposable as S}from"../../../../base/common/lifecycle.js";import{EditorActivation as u}from"../../../../platform/editor/common/editor.js";import{createDecorator as T,IInstantiationService as C}from"../../../../platform/instantiation/common/instantiation.js";import{DiffEditorInput as b}from"../../../common/editor/diffEditorInput.js";import{IWebviewService as D}from"../../webview/browser/webview.js";import{CONTEXT_ACTIVE_WEBVIEW_PANEL_ID as A}from"./webviewEditor.js";import{WebviewIconManager as G}from"./webviewIconManager.js";import{IEditorGroupsService as O}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as k}from"../../../services/editor/common/editorService.js";import{WebviewInput as a}from"./webviewEditorInput.js";const V=T("webviewEditorService");function l(v,t){return v.canResolve(t)}let c=class extends a{constructor(e,i,r){super(e,i,r.iconManager);this._webviewWorkbenchService=r}_resolved=!1;_resolvePromise;dispose(){super.dispose(),this._resolvePromise?.cancel(),this._resolvePromise=void 0}async resolve(){if(!this._resolved){this._resolved=!0,this._resolvePromise=W(e=>this._webviewWorkbenchService.resolveWebview(this,e));try{await this._resolvePromise}catch(e){if(!g(e))throw e}}return super.resolve()}transfer(e){if(super.transfer(e))return e._resolved=this._resolved,e}};p([m],c.prototype,"resolve",1),c=p([d(2,V)],c);class x{_awaitingRevival=[];enqueueForRestoration(t,e){const i=new _,r=()=>{const o=this._awaitingRevival.findIndex(s=>t===s.input);o>=0&&this._awaitingRevival.splice(o,1)},n=P(t.webview.onDidDispose(r),e.onCancellationRequested(()=>{r(),i.cancel()}));return this._awaitingRevival.push({input:t,promise:i,disposable:n}),i.p}reviveFor(t,e){const i=this._awaitingRevival.filter(({input:r})=>l(t,r));this._awaitingRevival=this._awaitingRevival.filter(({input:r})=>!l(t,r));for(const{input:r,promise:n,disposable:o}of i)t.resolveWebview(r,e).then(s=>n.complete(s),s=>n.error(s)).finally(()=>{o.dispose()})}}let w=class extends R{constructor(e,i,r,n){super();this._editorService=i;this._instantiationService=r;this._webviewService=n;this._iconManager=this._register(this._instantiationService.createInstance(G)),this._register(e.registerContextKeyProvider({contextKey:A,getGroupContextKeyValue:o=>this.getWebviewId(o.activeEditor)})),this._register(i.onDidActiveEditorChange(()=>{this.updateActiveWebview()})),this._register(n.onDidChangeActiveWebview(()=>{this.updateActiveWebview()})),this.updateActiveWebview()}_revivers=new Set;_revivalPool=new x;_iconManager;get iconManager(){return this._iconManager}_activeWebview;_onDidChangeActiveWebviewEditor=this._register(new y);onDidChangeActiveWebviewEditor=this._onDidChangeActiveWebviewEditor.event;getWebviewId(e){let i;return e instanceof a?i=e:e instanceof b&&(e.primary instanceof a?i=e.primary:e.secondary instanceof a&&(i=e.secondary)),i?.webview.providedViewType??""}updateActiveWebview(){const e=this._editorService.activeEditor;let i;e instanceof a?i=e:e instanceof b&&(e.primary instanceof a&&e.primary.webview===this._webviewService.activeWebview?i=e.primary:e.secondary instanceof a&&e.secondary.webview===this._webviewService.activeWebview&&(i=e.secondary)),i!==this._activeWebview&&(this._activeWebview=i,this._onDidChangeActiveWebviewEditor.fire(i))}openWebview(e,i,r,n){const o=this._webviewService.createWebviewOverlay(e),s=this._instantiationService.createInstance(a,{viewType:i,name:r,providedId:e.providedViewType},o,this.iconManager);return this._editorService.openEditor(s,{pinned:!0,preserveFocus:n.preserveFocus,activation:n.preserveFocus?u.RESTORE:void 0},n.group),s}revealWebview(e,i,r){const n=this.findTopLevelEditorForWebview(e);this._editorService.openEditor(n,{preserveFocus:r,activation:r?u.RESTORE:void 0},i)}findTopLevelEditorForWebview(e){for(const i of this._editorService.editors)if(i===e||i instanceof b&&(e===i.primary||e===i.secondary))return i;return e}openRevivedWebview(e){const i=this._webviewService.createWebviewOverlay(e.webviewInitInfo);i.state=e.state;const r=this._instantiationService.createInstance(c,{viewType:e.viewType,providedId:e.webviewInitInfo.providedViewType,name:e.title},i);return r.iconPath=e.iconPath,typeof e.group=="number"&&r.updateGroup(e.group),r}registerResolver(e){this._revivers.add(e);const i=new h;return this._revivalPool.reviveFor(e,i.token),S(()=>{this._revivers.delete(e),i.dispose(!0)})}shouldPersist(e){return e instanceof c?!0:E.some(this._revivers.values(),i=>l(i,e))}async tryRevive(e,i){for(const r of this._revivers.values())if(l(r,e))return await r.resolveWebview(e,i),!0;return!1}async resolveWebview(e,i){if(!await this.tryRevive(e,i)&&!i.isCancellationRequested)return this._revivalPool.enqueueForRestoration(e,i)}setIcons(e,i){this._iconManager.setIcons(e,i)}};w=p([d(0,O),d(1,k),d(2,C),d(3,D)],w);export{V as IWebviewWorkbenchService,c as LazilyResolvedWebviewEditorInput,w as WebviewEditorService};
