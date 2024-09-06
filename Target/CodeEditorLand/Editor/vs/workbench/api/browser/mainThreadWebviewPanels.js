var W=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var h=(s,o,e,i)=>{for(var t=i>1?void 0:i?I(o,e):o,r=s.length-1,n;r>=0;r--)(n=s[r])&&(t=(i?n(o,e,t):n(t))||t);return i&&t&&W(o,e,t),t},p=(s,o)=>(e,i)=>o(e,i,s);import{onUnexpectedError as S}from"../../../../vs/base/common/errors.js";import{Event as x}from"../../../../vs/base/common/event.js";import{Disposable as y,DisposableMap as P}from"../../../../vs/base/common/lifecycle.js";import{URI as f}from"../../../../vs/base/common/uri.js";import{generateUuid as _}from"../../../../vs/base/common/uuid.js";import{IConfigurationService as E}from"../../../../vs/platform/configuration/common/configuration.js";import{IStorageService as H}from"../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as G}from"../../../../vs/platform/telemetry/common/telemetry.js";import{reviveWebviewContentOptions as T,reviveWebviewExtension as C}from"../../../../vs/workbench/api/browser/mainThreadWebviews.js";import*as O from"../../../../vs/workbench/api/common/extHost.protocol.js";import{DiffEditorInput as F}from"../../../../vs/workbench/common/editor/diffEditorInput.js";import"../../../../vs/workbench/common/editor/editorInput.js";import{ExtensionKeyedWebviewOriginStore as D}from"../../../../vs/workbench/contrib/webview/browser/webview.js";import{WebviewInput as V}from"../../../../vs/workbench/contrib/webviewPanel/browser/webviewEditorInput.js";import"../../../../vs/workbench/contrib/webviewPanel/browser/webviewIconManager.js";import{IWebviewWorkbenchService as R}from"../../../../vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.js";import{editorGroupToColumn as m}from"../../../../vs/workbench/services/editor/common/editorGroupColumn.js";import{GroupLocation as $,GroupsOrder as z,IEditorGroupsService as M,preferredSideBySideGroupDirection as A}from"../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as b,IEditorService as k,SIDE_GROUP as g}from"../../../../vs/workbench/services/editor/common/editorService.js";import{IExtensionService as B}from"../../../../vs/workbench/services/extensions/common/extensions.js";import"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";class U{_handlesToInputs=new Map;_inputsToHandles=new Map;add(o,e){this._handlesToInputs.set(o,e),this._inputsToHandles.set(e,o)}getHandleForInput(o){return this._inputsToHandles.get(o)}getInputForHandle(o){return this._handlesToInputs.get(o)}delete(o){const e=this.getInputForHandle(o);this._handlesToInputs.delete(o),e&&this._inputsToHandles.delete(e)}get size(){return this._handlesToInputs.size}[Symbol.iterator](){return this._handlesToInputs.values()}}class N{constructor(o){this.prefix=o}fromExternal(o){return this.prefix+o}toExternal(o){return o.startsWith(this.prefix)?o.substr(this.prefix.length):void 0}}let u=class extends y{constructor(e,i,t,r,n,a,v,l,w){super();this._mainThreadWebviews=i;this._configurationService=t;this._editorGroupService=r;this._editorService=n;this._telemetryService=l;this._webviewWorkbenchService=w;this.webviewOriginStore=new D("mainThreadWebviewPanel.origins",v),this._proxy=e.getProxy(O.ExtHostContext.ExtHostWebviewPanels),this._register(x.any(n.onDidActiveEditorChange,n.onDidVisibleEditorsChange,r.onDidAddGroup,r.onDidRemoveGroup,r.onDidMoveGroup)(()=>{this.updateWebviewViewStates(this._editorService.activeEditor)})),this._register(w.onDidChangeActiveWebviewEditor(d=>{this.updateWebviewViewStates(d)})),this._register(w.registerResolver({canResolve:d=>{const c=this.webviewPanelViewType.toExternal(d.viewType);return typeof c=="string"&&a.activateByEvent(`onWebviewPanel:${c}`),!1},resolveWebview:()=>{throw new Error("not implemented")}}))}webviewPanelViewType=new N("mainThreadWebview-");_proxy;_webviewInputs=new U;_revivers=this._register(new P);webviewOriginStore;get webviewInputs(){return this._webviewInputs}addWebviewInput(e,i,t){this._webviewInputs.add(e,i),this._mainThreadWebviews.addWebview(e,i.webview,t),i.webview.onDidDispose(()=>{this._proxy.$onDidDisposeWebviewPanel(e).finally(()=>{this._webviewInputs.delete(e)})})}$createWebviewPanel(e,i,t,r,n){const a=this.getTargetGroupFromShowOptions(n),v=n?{preserveFocus:!!n.preserveFocus,group:a}:{},l=C(e),w=this.webviewOriginStore.getOrigin(t,l.id),d=this._webviewWorkbenchService.openWebview({origin:w,providedViewType:t,title:r.title,options:j(r.panelOptions),contentOptions:T(r.webviewOptions),extension:l},this.webviewPanelViewType.fromExternal(t),r.title,v);this.addWebviewInput(i,d,{serializeBuffersForPostMessage:r.serializeBuffersForPostMessage});const c={extensionId:l.id.value,viewType:t};this._telemetryService.publicLog2("webviews:createWebviewPanel",c)}$disposeWebview(e){const i=this.tryGetWebviewInput(e);i&&i.dispose()}$setTitle(e,i){this.tryGetWebviewInput(e)?.setName(i)}$setIconPath(e,i){const t=this.tryGetWebviewInput(e);t&&(t.iconPath=L(i))}$reveal(e,i){const t=this.tryGetWebviewInput(e);if(!t||t.isDisposed())return;const r=this.getTargetGroupFromShowOptions(i);this._webviewWorkbenchService.revealWebview(t,r,!!i.preserveFocus)}getTargetGroupFromShowOptions(e){if(typeof e.viewColumn>"u"||e.viewColumn===b||this._editorGroupService.count===1&&this._editorGroupService.activeGroup.isEmpty)return b;if(e.viewColumn===g)return g;if(e.viewColumn>=0){const i=this._editorGroupService.getGroups(z.GRID_APPEARANCE)[e.viewColumn];if(i)return i.id;const t=this._editorGroupService.findGroup({location:$.LAST});if(t){const r=A(this._configurationService);return this._editorGroupService.addGroup(t,r)}}return b}$registerSerializer(e,i){if(this._revivers.has(e))throw new Error(`Reviver for ${e} already registered`);this._revivers.set(e,this._webviewWorkbenchService.registerResolver({canResolve:t=>t.viewType===this.webviewPanelViewType.fromExternal(e),resolveWebview:async t=>{const r=this.webviewPanelViewType.toExternal(t.viewType);if(!r){t.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(t.viewType));return}const n=_();this.addWebviewInput(n,t,i);let a;if(t.webview.state)try{a=JSON.parse(t.webview.state)}catch(v){console.error("Could not load webview state",v,t.webview.state)}try{await this._proxy.$deserializeWebviewPanel(n,r,{title:t.getTitle(),state:a,panelOptions:t.webview.options,webviewOptions:t.webview.contentOptions,active:t===this._editorService.activeEditor},m(this._editorGroupService,t.group||0))}catch(v){S(v),t.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(r))}}}))}$unregisterSerializer(e){if(!this._revivers.has(e))throw new Error(`No reviver for ${e} registered`);this._revivers.deleteAndDispose(e)}updateWebviewViewStates(e){if(!this._webviewInputs.size)return;const i={},t=(r,n,a)=>{if(!(a instanceof V))return;a.updateGroup(r.id);const v=this._webviewInputs.getHandleForInput(a);v&&(i[v]={visible:n===r.activeEditor,active:a===e,position:m(this._editorGroupService,r.id)})};for(const r of this._editorGroupService.groups)for(const n of r.editors)n instanceof F?(t(r,n,n.primary),t(r,n,n.secondary)):t(r,n,n);Object.keys(i).length&&this._proxy.$onDidChangeWebviewPanelViewStates(i)}tryGetWebviewInput(e){return this._webviewInputs.getInputForHandle(e)}};u=h([p(2,E),p(3,M),p(4,k),p(5,B),p(6,H),p(7,G),p(8,R)],u);function L(s){if(s)return{light:f.revive(s.light),dark:f.revive(s.dark)}}function j(s){return{enableFindWidget:s.enableFindWidget,retainContextWhenHidden:s.retainContextWhenHidden}}export{u as MainThreadWebviewPanels};
