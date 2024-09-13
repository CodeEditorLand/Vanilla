var W=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var h=(s,o,e,i)=>{for(var t=i>1?void 0:i?I(o,e):o,r=s.length-1,n;r>=0;r--)(n=s[r])&&(t=(i?n(o,e,t):n(t))||t);return i&&t&&W(o,e,t),t},p=(s,o)=>(e,i)=>o(e,i,s);import{onUnexpectedError as y}from"../../../base/common/errors.js";import{Event as S}from"../../../base/common/event.js";import{Disposable as x,DisposableMap as P}from"../../../base/common/lifecycle.js";import{URI as f}from"../../../base/common/uri.js";import{generateUuid as _}from"../../../base/common/uuid.js";import{IConfigurationService as E}from"../../../platform/configuration/common/configuration.js";import{IStorageService as H}from"../../../platform/storage/common/storage.js";import{ITelemetryService as G}from"../../../platform/telemetry/common/telemetry.js";import{DiffEditorInput as T}from"../../common/editor/diffEditorInput.js";import{ExtensionKeyedWebviewOriginStore as C}from"../../contrib/webview/browser/webview.js";import{WebviewInput as O}from"../../contrib/webviewPanel/browser/webviewEditorInput.js";import{IWebviewWorkbenchService as F}from"../../contrib/webviewPanel/browser/webviewWorkbenchService.js";import{editorGroupToColumn as m}from"../../services/editor/common/editorGroupColumn.js";import{GroupLocation as D,GroupsOrder as V,IEditorGroupsService as R,preferredSideBySideGroupDirection as $}from"../../services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as b,IEditorService as z,SIDE_GROUP as g}from"../../services/editor/common/editorService.js";import{IExtensionService as M}from"../../services/extensions/common/extensions.js";import*as A from"../common/extHost.protocol.js";import{reviveWebviewContentOptions as k,reviveWebviewExtension as B}from"./mainThreadWebviews.js";class j{_handlesToInputs=new Map;_inputsToHandles=new Map;add(o,e){this._handlesToInputs.set(o,e),this._inputsToHandles.set(e,o)}getHandleForInput(o){return this._inputsToHandles.get(o)}getInputForHandle(o){return this._handlesToInputs.get(o)}delete(o){const e=this.getInputForHandle(o);this._handlesToInputs.delete(o),e&&this._inputsToHandles.delete(e)}get size(){return this._handlesToInputs.size}[Symbol.iterator](){return this._handlesToInputs.values()}}class U{constructor(o){this.prefix=o}fromExternal(o){return this.prefix+o}toExternal(o){return o.startsWith(this.prefix)?o.substr(this.prefix.length):void 0}}let u=class extends x{constructor(e,i,t,r,n,a,v,w,l){super();this._mainThreadWebviews=i;this._configurationService=t;this._editorGroupService=r;this._editorService=n;this._telemetryService=w;this._webviewWorkbenchService=l;this.webviewOriginStore=new C("mainThreadWebviewPanel.origins",v),this._proxy=e.getProxy(A.ExtHostContext.ExtHostWebviewPanels),this._register(S.any(n.onDidActiveEditorChange,n.onDidVisibleEditorsChange,r.onDidAddGroup,r.onDidRemoveGroup,r.onDidMoveGroup)(()=>{this.updateWebviewViewStates(this._editorService.activeEditor)})),this._register(l.onDidChangeActiveWebviewEditor(d=>{this.updateWebviewViewStates(d)})),this._register(l.registerResolver({canResolve:d=>{const c=this.webviewPanelViewType.toExternal(d.viewType);return typeof c=="string"&&a.activateByEvent(`onWebviewPanel:${c}`),!1},resolveWebview:()=>{throw new Error("not implemented")}}))}webviewPanelViewType=new U("mainThreadWebview-");_proxy;_webviewInputs=new j;_revivers=this._register(new P);webviewOriginStore;get webviewInputs(){return this._webviewInputs}addWebviewInput(e,i,t){this._webviewInputs.add(e,i),this._mainThreadWebviews.addWebview(e,i.webview,t),i.webview.onDidDispose(()=>{this._proxy.$onDidDisposeWebviewPanel(e).finally(()=>{this._webviewInputs.delete(e)})})}$createWebviewPanel(e,i,t,r,n){const a=this.getTargetGroupFromShowOptions(n),v=n?{preserveFocus:!!n.preserveFocus,group:a}:{},w=B(e),l=this.webviewOriginStore.getOrigin(t,w.id),d=this._webviewWorkbenchService.openWebview({origin:l,providedViewType:t,title:r.title,options:L(r.panelOptions),contentOptions:k(r.webviewOptions),extension:w},this.webviewPanelViewType.fromExternal(t),r.title,v);this.addWebviewInput(i,d,{serializeBuffersForPostMessage:r.serializeBuffersForPostMessage});const c={extensionId:w.id.value,viewType:t};this._telemetryService.publicLog2("webviews:createWebviewPanel",c)}$disposeWebview(e){const i=this.tryGetWebviewInput(e);i&&i.dispose()}$setTitle(e,i){this.tryGetWebviewInput(e)?.setName(i)}$setIconPath(e,i){const t=this.tryGetWebviewInput(e);t&&(t.iconPath=N(i))}$reveal(e,i){const t=this.tryGetWebviewInput(e);if(!t||t.isDisposed())return;const r=this.getTargetGroupFromShowOptions(i);this._webviewWorkbenchService.revealWebview(t,r,!!i.preserveFocus)}getTargetGroupFromShowOptions(e){if(typeof e.viewColumn>"u"||e.viewColumn===b||this._editorGroupService.count===1&&this._editorGroupService.activeGroup.isEmpty)return b;if(e.viewColumn===g)return g;if(e.viewColumn>=0){const i=this._editorGroupService.getGroups(V.GRID_APPEARANCE)[e.viewColumn];if(i)return i.id;const t=this._editorGroupService.findGroup({location:D.LAST});if(t){const r=$(this._configurationService);return this._editorGroupService.addGroup(t,r)}}return b}$registerSerializer(e,i){if(this._revivers.has(e))throw new Error(`Reviver for ${e} already registered`);this._revivers.set(e,this._webviewWorkbenchService.registerResolver({canResolve:t=>t.viewType===this.webviewPanelViewType.fromExternal(e),resolveWebview:async t=>{const r=this.webviewPanelViewType.toExternal(t.viewType);if(!r){t.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(t.viewType));return}const n=_();this.addWebviewInput(n,t,i);let a;if(t.webview.state)try{a=JSON.parse(t.webview.state)}catch{}try{await this._proxy.$deserializeWebviewPanel(n,r,{title:t.getTitle(),state:a,panelOptions:t.webview.options,webviewOptions:t.webview.contentOptions,active:t===this._editorService.activeEditor},m(this._editorGroupService,t.group||0))}catch(v){y(v),t.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(r))}}}))}$unregisterSerializer(e){if(!this._revivers.has(e))throw new Error(`No reviver for ${e} registered`);this._revivers.deleteAndDispose(e)}updateWebviewViewStates(e){if(!this._webviewInputs.size)return;const i={},t=(r,n,a)=>{if(!(a instanceof O))return;a.updateGroup(r.id);const v=this._webviewInputs.getHandleForInput(a);v&&(i[v]={visible:n===r.activeEditor,active:a===e,position:m(this._editorGroupService,r.id)})};for(const r of this._editorGroupService.groups)for(const n of r.editors)n instanceof T?(t(r,n,n.primary),t(r,n,n.secondary)):t(r,n,n);Object.keys(i).length&&this._proxy.$onDidChangeWebviewPanelViewStates(i)}tryGetWebviewInput(e){return this._webviewInputs.getInputForHandle(e)}};u=h([p(2,E),p(3,R),p(4,z),p(5,M),p(6,H),p(7,G),p(8,F)],u);function N(s){if(s)return{light:f.revive(s.light),dark:f.revive(s.dark)}}function L(s){return{enableFindWidget:s.enableFindWidget,retainContextWhenHidden:s.retainContextWhenHidden}}export{u as MainThreadWebviewPanels};
