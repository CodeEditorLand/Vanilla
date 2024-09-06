var D=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var b=(h,d,e,i)=>{for(var t=i>1?void 0:i?W(d,e):d,s=h.length-1,o;s>=0;s--)(o=h[s])&&(t=(i?o(d,e,t):o(t))||t);return i&&t&&D(d,e,t),t},a=(h,d)=>(e,i)=>d(e,i,h);import{isFirefox as y}from"../../../../base/browser/browser.js";import{addDisposableListener as g,EventType as p,getWindowById as E}from"../../../../base/browser/dom.js";import{parentOriginHash as I}from"../../../../base/browser/iframe.js";import"../../../../base/browser/mouseEvent.js";import"../../../../base/browser/window.js";import{promiseWithResolvers as x,ThrottledDelayer as M}from"../../../../base/common/async.js";import{streamToBuffer as F}from"../../../../base/common/buffer.js";import{CancellationTokenSource as R}from"../../../../base/common/cancellation.js";import{Emitter as r,Event as k}from"../../../../base/common/event.js";import{Disposable as A,toDisposable as O}from"../../../../base/common/lifecycle.js";import{COI as T}from"../../../../base/common/network.js";import{URI as C}from"../../../../base/common/uri.js";import{generateUuid as B}from"../../../../base/common/uuid.js";import{localize as P}from"../../../../nls.js";import{IAccessibilityService as K}from"../../../../platform/accessibility/common/accessibility.js";import{MenuId as L}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as H}from"../../../../platform/configuration/common/configuration.js";import"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as U}from"../../../../platform/contextview/browser/contextView.js";import"../../../../platform/extensions/common/extensions.js";import{IFileService as V}from"../../../../platform/files/common/files.js";import{IInstantiationService as N}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as z}from"../../../../platform/log/common/log.js";import{INotificationService as $}from"../../../../platform/notification/common/notification.js";import{IRemoteAuthorityResolverService as q}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{ITelemetryService as j}from"../../../../platform/telemetry/common/telemetry.js";import{ITunnelService as Y}from"../../../../platform/tunnel/common/tunnel.js";import{WebviewPortMappingManager as G}from"../../../../platform/webview/common/webviewPortMapping.js";import{IWorkbenchEnvironmentService as X}from"../../../services/environment/common/environmentService.js";import{decodeAuthority as J,webviewGenericCspSource as Q,webviewRootResourceAuthority as Z}from"../common/webview.js";import{loadLocalResource as ee,WebviewResourceResponse as m}from"./resourceLoading.js";import"./themeing.js";import{areWebviewContentOptionsEqual as te}from"./webview.js";import{WebviewFindWidget as ie}from"./webviewFindWidget.js";import"./webviewMessages.js";var _;(i=>{let h;(o=>(o[o.Initializing=0]="Initializing",o[o.Ready=1]="Ready"))(h=i.Type||={});class d{constructor(s){this.pendingMessages=s}type=0}i.Initializing=d,i.Ready={type:1}})(_||={});const ne="webviewId";let u=class extends A{constructor(e,i,t,s,o,l,f,se,oe,re,ae,S,w){super();this.webviewThemeDataProvider=i;this._environmentService=l;this._fileService=f;this._logService=se;this._remoteAuthorityResolverService=oe;this._telemetryService=re;this._tunnelService=ae;this._accessibilityService=w;this.providedViewType=e.providedViewType,this.origin=e.origin??this.id,this._options=e.options,this.extension=e.extension,this._content={html:"",title:e.title,options:e.contentOptions,state:void 0},this._portMappingManager=this._register(new G(()=>this.extension?.location,()=>this._content.options.portMapping||[],this._tunnelService)),this._element=this._createElement(e.options,e.contentOptions),this._register(this.on("no-csp-found",()=>{this.handleNoCspFound()})),this._register(this.on("did-click-link",({uri:n})=>{this._onDidClickLink.fire(n)})),this._register(this.on("onmessage",({message:n,transfer:c})=>{this._onMessage.fire({message:n,transfer:c})})),this._register(this.on("did-scroll",({scrollYPercentage:n})=>{this._onDidScroll.fire({scrollYPercentage:n})})),this._register(this.on("do-reload",()=>{this.reload()})),this._register(this.on("do-update-state",n=>{this.state=n,this._onDidUpdateState.fire(n)})),this._register(this.on("did-focus",()=>{this.handleFocusChange(!0)})),this._register(this.on("did-blur",()=>{this.handleFocusChange(!1)})),this._register(this.on("did-scroll-wheel",n=>{this._onDidWheel.fire(n)})),this._register(this.on("did-find",({didFind:n})=>{this._hasFindResult.fire(n)})),this._register(this.on("fatal-error",n=>{o.error(P("fatalErrorMessage","Error loading webview: {0}",n.message)),this._onFatalError.fire({message:n.message})})),this._register(this.on("did-keydown",n=>{this.handleKeyEvent("keydown",n)})),this._register(this.on("did-keyup",n=>{this.handleKeyEvent("keyup",n)})),this._register(this.on("did-context-menu",n=>{if(!this.element||!this._contextKeyService)return;const c=this.element.getBoundingClientRect(),v=this._contextKeyService.createOverlay([...Object.entries(n.context),[ne,this.providedViewType]]);s.showContextMenu({menuId:L.WebviewContext,menuActionOptions:{shouldForwardArgs:!0},contextKeyService:v,getActionsContext:()=>({...n.context,webview:this.providedViewType}),getAnchor:()=>({x:c.x+n.clientX,y:c.y+n.clientY})}),this._send("set-context-menu-visible",{visible:!0})})),this._register(this.on("load-resource",async n=>{try{const c=J(n.authority),v=C.from({scheme:n.scheme,authority:c,path:decodeURIComponent(n.path),query:n.query?decodeURIComponent(n.query):n.query});this.loadResource(n.id,v,n.ifNoneMatch)}catch{this._send("did-load-resource",{id:n.id,status:404,path:n.path})}})),this._register(this.on("load-localhost",n=>{this.localLocalhost(n.id,n.origin)})),this._register(k.runAndSubscribe(i.onThemeDataChanged,()=>this.style())),this._register(w.onDidChangeReducedMotion(()=>this.style())),this._register(w.onDidChangeScreenReaderOptimized(()=>this.style())),this._register(s.onDidHideContextMenu(()=>this._send("set-context-menu-visible",{visible:!1}))),this._confirmBeforeClose=t.getValue("window.confirmBeforeClose"),this._register(t.onDidChangeConfiguration(n=>{n.affectsConfiguration("window.confirmBeforeClose")&&(this._confirmBeforeClose=t.getValue("window.confirmBeforeClose"),this._send("set-confirm-before-close",this._confirmBeforeClose))})),this._register(this.on("drag-start",()=>{this._startBlockingIframeDragEvents()})),this._register(this.on("drag",n=>{this.handleDragEvent("drag",n)})),e.options.enableFindWidget&&(this._webviewFindWidget=this._register(S.createInstance(ie,this)))}id=B();providedViewType;origin;_windowId=void 0;get window(){return typeof this._windowId=="number"?E(this._windowId)?.window:void 0}_encodedWebviewOriginPromise;_encodedWebviewOrigin;get platform(){return"browser"}_expectedServiceWorkerVersion=4;_element;get element(){return this._element}_focused;get isFocused(){return!(!this._focused||!this.window||this.window.document.activeElement&&this.window.document.activeElement!==this.element)}_state=new _.Initializing([]);_content;_portMappingManager;_resourceLoadingCts=this._register(new R);_contextKeyService;_confirmBeforeClose;_focusDelayer=this._register(new M(50));_onDidHtmlChange=this._register(new r);onDidHtmlChange=this._onDidHtmlChange.event;_messagePort;_messageHandlers=new Map;_webviewFindWidget;checkImeCompletionState=!0;_disposed=!1;extension;_options;dispose(){if(this._disposed=!0,this.element?.remove(),this._element=void 0,this._messagePort=void 0,this._state.type===0){for(const e of this._state.pendingMessages)e.resolve(!1);this._state.pendingMessages=[]}this._onDidDispose.fire(),this._resourceLoadingCts.dispose(!0),super.dispose()}setContextKeyService(e){this._contextKeyService=e}_onMissingCsp=this._register(new r);onMissingCsp=this._onMissingCsp.event;_onDidClickLink=this._register(new r);onDidClickLink=this._onDidClickLink.event;_onDidReload=this._register(new r);onDidReload=this._onDidReload.event;_onMessage=this._register(new r);onMessage=this._onMessage.event;_onDidScroll=this._register(new r);onDidScroll=this._onDidScroll.event;_onDidWheel=this._register(new r);onDidWheel=this._onDidWheel.event;_onDidUpdateState=this._register(new r);onDidUpdateState=this._onDidUpdateState.event;_onDidFocus=this._register(new r);onDidFocus=this._onDidFocus.event;_onDidBlur=this._register(new r);onDidBlur=this._onDidBlur.event;_onFatalError=this._register(new r);onFatalError=this._onFatalError.event;_onDidDispose=this._register(new r);onDidDispose=this._onDidDispose.event;postMessage(e,i){return this._send("message",{message:e,transfer:i})}async _send(e,i,t=[]){if(this._state.type===0){const{promise:s,resolve:o}=x();return this._state.pendingMessages.push({channel:e,data:i,transferable:t,resolve:o}),s}else return this.doPostMessage(e,i,t)}_createElement(e,i){const t=document.createElement("iframe");t.name=this.id,t.className=`webview ${e.customClasses||""}`,t.sandbox.add("allow-scripts","allow-same-origin","allow-forms","allow-pointer-lock","allow-downloads");const s=["cross-origin-isolated","autoplay"];return y||s.push("clipboard-read","clipboard-write"),t.setAttribute("allow",s.join("; ")),t.style.border="none",t.style.width="100%",t.style.height="100%",t.focus=()=>{this._doFocus()},t}_initElement(e,i,t,s){const o={id:this.id,origin:this.origin,swVersion:String(this._expectedServiceWorkerVersion),extensionId:i?.id.value??"",platform:this.platform,"vscode-resource-base-authority":Z,parentOrigin:s.origin};this._options.disableServiceWorker&&(o.disableServiceWorker="true"),this._environmentService.remoteAuthority&&(o.remoteAuthority=this._environmentService.remoteAuthority),t.purpose&&(o.purpose=t.purpose),T.addSearchParam(o,!0,!0);const l=new URLSearchParams(o).toString(),f=y?"index-no-csp.html":"index.html";this.element.setAttribute("src",`${this.webviewContentEndpoint(e)}/${f}?${l}`)}mountTo(e,i){if(this.element){this._windowId=i.vscodeWindowId,this._encodedWebviewOriginPromise=I(i.origin,this.origin).then(t=>this._encodedWebviewOrigin=t),this._encodedWebviewOriginPromise.then(t=>{this._disposed||this._initElement(t,this.extension,this._options,i)}),this._registerMessageHandler(i),this._webviewFindWidget&&e.appendChild(this._webviewFindWidget.getDomNode());for(const t of[p.MOUSE_DOWN,p.MOUSE_MOVE,p.DROP])this._register(g(e,t,()=>{this._stopBlockingIframeDragEvents()}));for(const t of[e,i])this._register(g(t,p.DRAG_END,()=>{this._stopBlockingIframeDragEvents()}));e.id=this.id,e.appendChild(this.element)}}_registerMessageHandler(e){const i=this._register(g(e,"message",t=>{if(!(!this._encodedWebviewOrigin||t?.data?.target!==this.id)){if(t.origin!==this._webviewContentOrigin(this._encodedWebviewOrigin)){console.log(`Skipped renderer receiving message due to mismatched origins: ${t.origin} ${this._webviewContentOrigin}`);return}if(t.data.channel==="webview-ready"){if(this._messagePort)return;this._logService.debug(`Webview(${this.id}): webview ready`),this._messagePort=t.ports[0],this._messagePort.onmessage=s=>{const o=this._messageHandlers.get(s.data.channel);if(!o){console.log(`No handlers found for '${s.data.channel}'`);return}o?.forEach(l=>l(s.data.data,s))},this.element?.classList.add("ready"),this._state.type===0&&this._state.pendingMessages.forEach(({channel:s,data:o,resolve:l})=>l(this.doPostMessage(s,o))),this._state=_.Ready,i.dispose()}}}))}_startBlockingIframeDragEvents(){this.element&&(this.element.style.pointerEvents="none")}_stopBlockingIframeDragEvents(){this.element&&(this.element.style.pointerEvents="auto")}webviewContentEndpoint(e){const i=this._environmentService.webviewExternalEndpoint;if(!i)throw new Error("'webviewExternalEndpoint' has not been configured. Webviews will not work!");const t=i.replace("{{uuid}}",e);return t[t.length-1]==="/"?t.slice(0,t.length-1):t}_webviewContentOrigin(e){const i=C.parse(this.webviewContentEndpoint(e));return i.scheme+"://"+i.authority.toLowerCase()}doPostMessage(e,i,t=[]){return this.element&&this._messagePort?(this._messagePort.postMessage({channel:e,args:i},t),!0):!1}on(e,i){let t=this._messageHandlers.get(e);return t||(t=new Set,this._messageHandlers.set(e,t)),t.add(i),O(()=>{this._messageHandlers.get(e)?.delete(i)})}_hasAlertedAboutMissingCsp=!1;handleNoCspFound(){if(!this._hasAlertedAboutMissingCsp&&(this._hasAlertedAboutMissingCsp=!0,this.extension?.id)){this._environmentService.isExtensionDevelopment&&this._onMissingCsp.fire(this.extension.id);const e={extension:this.extension.id.value};this._telemetryService.publicLog2("webviewMissingCsp",e)}}reload(){this.doUpdateContent(this._content);const e=this._register(this.on("did-load",()=>{this._onDidReload.fire(),e.dispose()}))}setHtml(e){this.doUpdateContent({...this._content,html:e}),this._onDidHtmlChange.fire(e)}setTitle(e){this._content={...this._content,title:e},this._send("set-title",e)}set contentOptions(e){if(this._logService.debug(`Webview(${this.id}): will update content options`),te(e,this._content.options)){this._logService.debug(`Webview(${this.id}): skipping content options update`);return}this.doUpdateContent({...this._content,options:e})}set localResourcesRoot(e){this._content={...this._content,options:{...this._content.options,localResourceRoots:e}}}set state(e){this._content={...this._content,state:e}}set initialScrollProgress(e){this._send("initial-scroll-position",e)}doUpdateContent(e){this._logService.debug(`Webview(${this.id}): will update content`),this._content=e;const i=!!this._content.options.allowScripts;this._send("content",{contents:this._content.html,title:this._content.title,options:{allowMultipleAPIAcquire:!!this._content.options.allowMultipleAPIAcquire,allowScripts:i,allowForms:this._content.options.allowForms??i},state:this._content.state,cspSource:Q,confirmBeforeClose:this._confirmBeforeClose})}style(){let{styles:e,activeTheme:i,themeLabel:t,themeId:s}=this.webviewThemeDataProvider.getWebviewThemeData();this._options.transformCssVariables&&(e=this._options.transformCssVariables(e));const o=this._accessibilityService.isMotionReduced(),l=this._accessibilityService.isScreenReaderOptimized();this._send("styles",{styles:e,activeTheme:i,themeId:s,themeLabel:t,reduceMotion:o,screenReader:l})}handleFocusChange(e){this._focused=e,e?this._onDidFocus.fire():this._onDidBlur.fire()}handleKeyEvent(e,i){const t=new KeyboardEvent(e,i);Object.defineProperty(t,"target",{get:()=>this.element}),this.window?.dispatchEvent(t)}handleDragEvent(e,i){const t=new DragEvent(e,i);Object.defineProperty(t,"target",{get:()=>this.element}),this.window?.dispatchEvent(t)}windowDidDragStart(){this._startBlockingIframeDragEvents()}windowDidDragEnd(){this._stopBlockingIframeDragEvents()}selectAll(){this.execCommand("selectAll")}copy(){this.execCommand("copy")}paste(){this.execCommand("paste")}cut(){this.execCommand("cut")}undo(){this.execCommand("undo")}redo(){this.execCommand("redo")}execCommand(e){this.element&&this._send("execCommand",e)}async loadResource(e,i,t){try{const s=await ee(i,{ifNoneMatch:t,roots:this._content.options.localResourceRoots||[]},this._fileService,this._logService,this._resourceLoadingCts.token);switch(s.type){case m.Type.Success:{const o=await this.streamToBuffer(s.stream);return this._send("did-load-resource",{id:e,status:200,path:i.path,mime:s.mimeType,data:o,etag:s.etag,mtime:s.mtime},[o])}case m.Type.NotModified:return this._send("did-load-resource",{id:e,status:304,path:i.path,mime:s.mimeType,mtime:s.mtime});case m.Type.AccessDenied:return this._send("did-load-resource",{id:e,status:401,path:i.path})}}catch{}return this._send("did-load-resource",{id:e,status:404,path:i.path})}async streamToBuffer(e){return(await F(e)).buffer.buffer}async localLocalhost(e,i){const t=this._environmentService.remoteAuthority,s=t?await this._remoteAuthorityResolverService.resolveAuthority(t):void 0,o=s?await this._portMappingManager.getRedirect(s.authority,i):void 0;return this._send("did-load-localhost",{id:e,origin:i,location:o})}focus(){this._doFocus(),this.handleFocusChange(!0)}_doFocus(){if(this.element){try{this.element.contentWindow?.focus()}catch{}this._focusDelayer.trigger(async()=>{!this.isFocused||!this.element||this.window?.document.activeElement&&this.window.document.activeElement!==this.element&&this.window.document.activeElement?.tagName!=="BODY"||(this.window?.document.body?.focus(),this._send("focus",void 0))})}}_hasFindResult=this._register(new r);hasFindResult=this._hasFindResult.event;_onDidStopFind=this._register(new r);onDidStopFind=this._onDidStopFind.event;find(e,i){this.element&&this._send("find",{value:e,previous:i})}updateFind(e){!e||!this.element||this._send("find",{value:e})}stopFind(e){this.element&&(this._send("find-stop",{clearSelection:!e}),this._onDidStopFind.fire())}showFind(e=!0){this._webviewFindWidget?.reveal(void 0,e)}hideFind(e=!0){this._webviewFindWidget?.hide(e)}runFindAction(e){this._webviewFindWidget?.find(e)}};u=b([a(2,H),a(3,U),a(4,$),a(5,X),a(6,V),a(7,z),a(8,q),a(9,j),a(10,Y),a(11,N),a(12,K)],u);export{u as WebviewElement};
