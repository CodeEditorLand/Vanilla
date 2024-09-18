var B=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var k=(f,m,r,t)=>{for(var e=t>1?void 0:t?C(m,r):m,s=f.length-1,i;s>=0;s--)(i=f[s])&&(e=(t?i(m,r,e):i(e))||e);return t&&e&&B(m,r,e),e},a=(f,m)=>(r,t)=>m(r,t,f);import*as $ from"../../../../base/browser/dom.js";import{parentOriginHash as q}from"../../../../base/browser/iframe.js";import{mainWindow as y}from"../../../../base/browser/window.js";import{isESM as P}from"../../../../base/common/amd.js";import{Barrier as K}from"../../../../base/common/async.js";import{VSBuffer as D}from"../../../../base/common/buffer.js";import{canceled as E,onUnexpectedError as j}from"../../../../base/common/errors.js";import{Emitter as H,Event as I}from"../../../../base/common/event.js";import{Disposable as F,toDisposable as V}from"../../../../base/common/lifecycle.js";import{COI as X,FileAccess as U}from"../../../../base/common/network.js";import*as v from"../../../../base/common/platform.js";import{joinPath as z}from"../../../../base/common/resources.js";import{URI as T}from"../../../../base/common/uri.js";import{generateUuid as M}from"../../../../base/common/uuid.js";import"../../../../base/parts/ipc/common/ipc.js";import{getNLSLanguage as G,getNLSMessages as J}from"../../../../nls.js";import{ILabelService as Y}from"../../../../platform/label/common/label.js";import{ILayoutService as Q}from"../../../../platform/layout/browser/layoutService.js";import{ILogService as Z,ILoggerService as ee}from"../../../../platform/log/common/log.js";import{IProductService as te}from"../../../../platform/product/common/productService.js";import{IStorageService as re,StorageScope as R,StorageTarget as oe}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as ie}from"../../../../platform/telemetry/common/telemetry.js";import{isLoggingOnly as se}from"../../../../platform/telemetry/common/telemetryUtils.js";import{IUserDataProfilesService as ne}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as ae,WorkbenchState as ce}from"../../../../platform/workspace/common/workspace.js";import{IBrowserWorkbenchEnvironmentService as le}from"../../environment/browser/environmentService.js";import{ExtensionHostExitCode as w,MessageType as L,UIKind as O,createMessageOfType as me,isMessageOfType as A}from"../common/extensionHostProtocol.js";import"../common/extensionRunningLocation.js";import{ExtensionHostStartup as pe}from"../common/extensions.js";let b=class extends F{constructor(r,t,e,s,i,p,l,u,c,h,S,d,W){super();this.runningLocation=r;this.startup=t;this._initDataProvider=e;this._telemetryService=s;this._contextService=i;this._labelService=p;this._logService=l;this._loggerService=u;this._environmentService=c;this._userDataProfilesService=h;this._productService=S;this._layoutService=d;this._storageService=W;this._isTerminating=!1,this._protocolPromise=null,this._protocol=null,this._extensionHostLogsLocation=z(this._environmentService.extHostLogsPath,"webWorker")}pid=null;remoteAuthority=null;extensions=null;_onDidExit=this._register(new H);onExit=this._onDidExit.event;_isTerminating;_protocolPromise;_protocol;_extensionHostLogsLocation;async _getWebWorkerExtensionHostIframeSrc(){const r=new URLSearchParams;this._environmentService.debugExtensionHost&&this._environmentService.debugRenderer&&r.set("debugged","1"),X.addSearchParam(r,!0,!0);const t=`?${r.toString()}`,e=`vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.${P?"esm.":""}html`;if(v.isWeb){const i=this._productService.webEndpointUrlTemplate,p=this._productService.commit,l=this._productService.quality;if(i&&p&&l){const u="webWorkerExtensionHostIframeStableOriginUUID";let c=this._storageService.get(u,R.WORKSPACE);typeof c>"u"&&(c=M(),this._storageService.store(u,c,R.WORKSPACE,oe.MACHINE));const h=await q(y.origin,c),S=i.replace("{{uuid}}",`v--${h}`).replace("{{commit}}",p).replace("{{quality}}",l),d=new URL(`${S}/out/${e}${t}`);return d.searchParams.set("parentOrigin",y.origin),d.searchParams.set("salt",c),d.toString()}}return`${U.asBrowserUri(e).toString(!0)}${t}`}async start(){return this._protocolPromise||(this._protocolPromise=this._startInsideIframe(),this._protocolPromise.then(r=>this._protocol=r)),this._protocolPromise}async _startInsideIframe(){const r=await this._getWebWorkerExtensionHostIframeSrc(),t=this._register(new H),e=document.createElement("iframe");e.setAttribute("class","web-worker-ext-host-iframe"),e.setAttribute("sandbox","allow-scripts allow-same-origin"),e.setAttribute("allow","usb; serial; hid; cross-origin-isolated;"),e.setAttribute("aria-hidden","true"),e.style.display="none";const s=M();e.setAttribute("src",`${r}&vscodeWebWorkerExtHostId=${s}`);const i=new K;let p,l=null,u=!1,c=null;const h=(o,n)=>{l=n,u=!0,j(l),clearTimeout(c),this._onDidExit.fire([w.UnexpectedError,l.message]),i.open()},S=o=>{p=o,clearTimeout(c),i.open()};if(c=setTimeout(()=>{},6e4),this._register($.addDisposableListener(y,"message",o=>{if(o.source!==e.contentWindow||o.data.vscodeWebWorkerExtHostId!==s)return;if(o.data.error){const{name:g,message:x,stack:N}=o.data.error,_=new Error;return _.message=x,_.name=g,_.stack=N,h(w.UnexpectedError,_)}if(o.data.type==="vscode.bootstrap.nls"){const g="vs/base/worker/workerMain.js",x=P?void 0:require.toUrl(g).slice(0,-g.length);e.contentWindow.postMessage({type:o.data.type,data:{baseUrl:x,workerUrl:P?U.asBrowserUri("vs/workbench/api/worker/extensionHostWorker.esm.js").toString(!0):require.toUrl(g),fileRoot:globalThis._VSCODE_FILE_ROOT,nls:{messages:J(),language:G()}}},"*");return}const{data:n}=o.data;if(i.isOpen()||!(n instanceof MessagePort)){const g=new Error("UNEXPECTED message");return h(w.UnexpectedError,g)}S(n)})),this._layoutService.mainContainer.appendChild(e),this._register(V(()=>e.remove())),await i.wait(),u)throw l;const d=this._environmentService.options?.messagePorts??new Map;e.contentWindow.postMessage({type:"vscode.init",data:d},"*",[...d.values()]),p.onmessage=o=>{const{data:n}=o;if(!(n instanceof ArrayBuffer)){this._onDidExit.fire([77,"UNKNOWN data received"]);return}t.fire(D.wrap(new Uint8Array(n,0,n.byteLength)))};const W={onMessage:t.event,send:o=>{const n=o.buffer.buffer.slice(o.buffer.byteOffset,o.buffer.byteOffset+o.buffer.byteLength);p.postMessage(n,[n])}};return this._performHandshake(W)}async _performHandshake(r){if(await I.toPromise(I.filter(r.onMessage,t=>A(t,L.Ready))),this._isTerminating)throw E();if(r.send(D.fromString(JSON.stringify(await this._createExtHostInitData()))),this._isTerminating)throw E();if(await I.toPromise(I.filter(r.onMessage,t=>A(t,L.Initialized))),this._isTerminating)throw E();return r}dispose(){this._isTerminating||(this._isTerminating=!0,this._protocol?.send(me(L.Terminate)),super.dispose())}getInspectPort(){}enableInspectPort(){return Promise.resolve(!1)}async _createExtHostInitData(){const r=await this._initDataProvider.getInitData();this.extensions=r.extensions;const t=this._contextService.getWorkspace(),e=this._productService.extensionsGallery?.nlsBaseUrl;let s;return e&&this._productService.commit&&!v.Language.isDefaultVariant()&&(s=T.joinPath(T.parse(e),this._productService.commit,this._productService.version,v.Language.value())),{commit:this._productService.commit,version:this._productService.version,quality:this._productService.quality,parentPid:0,environment:{isExtensionDevelopmentDebug:this._environmentService.debugRenderer,appName:this._productService.nameLong,appHost:this._productService.embedderIdentifier??(v.isWeb?"web":"desktop"),appUriScheme:this._productService.urlProtocol,appLanguage:v.language,extensionTelemetryLogResource:this._environmentService.extHostTelemetryLogFile,isExtensionTelemetryLoggingOnly:se(this._productService,this._environmentService),extensionDevelopmentLocationURI:this._environmentService.extensionDevelopmentLocationURI,extensionTestsLocationURI:this._environmentService.extensionTestsLocationURI,globalStorageHome:this._userDataProfilesService.defaultProfile.globalStorageHome,workspaceStorageHome:this._environmentService.workspaceStorageHome,extensionLogLevel:this._environmentService.extensionLogLevel},workspace:this._contextService.getWorkbenchState()===ce.EMPTY?void 0:{configuration:t.configuration||void 0,id:t.id,name:this._labelService.getWorkspaceLabel(t),transient:t.transient},consoleForward:{includeStack:!1,logNative:this._environmentService.debugRenderer},extensions:this.extensions.toSnapshot(),nlsBaseUrl:s,telemetryInfo:{sessionId:this._telemetryService.sessionId,machineId:this._telemetryService.machineId,sqmId:this._telemetryService.sqmId,devDeviceId:this._telemetryService.devDeviceId,firstSessionDate:this._telemetryService.firstSessionDate,msftInternal:this._telemetryService.msftInternal},logLevel:this._logService.getLevel(),loggers:[...this._loggerService.getRegisteredLoggers()],logsLocation:this._extensionHostLogsLocation,autoStart:this.startup===pe.EagerAutoStart,remote:{authority:this._environmentService.remoteAuthority,connectionData:null,isRemote:!1},uiKind:v.isWeb?O.Web:O.Desktop}}};b=k([a(3,ie),a(4,ae),a(5,Y),a(6,Z),a(7,ee),a(8,le),a(9,ne),a(10,te),a(11,Q),a(12,re)],b);export{b as WebWorkerExtensionHost};
