var I=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var m=(a,o,e,t)=>{for(var i=t>1?void 0:t?g(o,e):o,n=a.length-1,s;n>=0;n--)(s=a[n])&&(i=(t?s(o,e,i):s(i))||i);return t&&i&&I(o,e,i),i},r=(a,o)=>(e,t)=>o(e,t,a);import{isCodeEditor as P}from"../../../../editor/browser/editorBrowser.js";import{ILifecycleService as l,StartupKind as _,StartupKindToString as C}from"../../../services/lifecycle/common/lifecycle.js";import{IUpdateService as S}from"../../../../platform/update/common/update.js";import*as E from"../../files/common/files.js";import{IEditorService as f}from"../../../services/editor/common/editorService.js";import{IWorkspaceTrustManagementService as u}from"../../../../platform/workspace/common/workspaceTrust.js";import{IPaneCompositePartService as h}from"../../../services/panecomposite/browser/panecomposite.js";import{ViewContainerLocation as d}from"../../../common/views.js";import{ILogService as b}from"../../../../platform/log/common/log.js";import{IProductService as k}from"../../../../platform/product/common/productService.js";import{ITelemetryService as y}from"../../../../platform/telemetry/common/telemetry.js";import{IBrowserWorkbenchEnvironmentService as L}from"../../../services/environment/browser/environmentService.js";import{ITimerService as W}from"../../../services/timer/browser/timerService.js";import"../../../common/contributions.js";import{posix as w}from"../../../../base/common/path.js";import{hash as $}from"../../../../base/common/hash.js";let c=class{constructor(o,e,t,i,n){this._editorService=o;this._paneCompositeService=e;this._lifecycleService=t;this._updateService=i;this._workspaceTrustService=n}async _isStandardStartup(){if(this._lifecycleService.startupKind!==_.NewWindow)return C(this._lifecycleService.startupKind);if(!this._workspaceTrustService.isWorkspaceTrusted())return"Workspace not trusted";const o=this._paneCompositeService.getActivePaneComposite(d.Sidebar);if(!o||o.getId()!==E.VIEWLET_ID)return"Explorer viewlet not visible";const e=this._editorService.visibleEditorPanes;if(e.length!==1)return`Expected text editor count : 1, Actual : ${e.length}`;if(!P(e[0].getControl()))return"Active editor is not a text editor";const t=this._paneCompositeService.getActivePaneComposite(d.Panel);if(t)return`Current active panel : ${this._paneCompositeService.getPaneComposite(t.getId(),d.Panel)?.name}`;if(await this._updateService.isLatestVersion()===!1)return"Not on latest version, updates available"}};c=m([r(0,f),r(1,h),r(2,l),r(3,S),r(4,u)],c);let p=class extends c{constructor(e,t,i,n,s,x,T,A,D,M){super(e,t,i,n,s);this.timerService=x;this.logService=T;this.environmentService=A;this.telemetryService=D;this.productService=M;this.logPerfMarks()}async logPerfMarks(){if(!this.environmentService.profDurationMarkers)return;await this.timerService.whenReady();const e=await this._isStandardStartup(),t=await this.timerService.perfBaseline,[i,n]=this.environmentService.profDurationMarkers,s=`${this.timerService.getDuration(i,n)}	${this.productService.nameShort}	${(this.productService.commit||"").slice(0,10)||"0000000000"}	${this.telemetryService.sessionId}	${e===void 0?"standard_start":"NO_standard_start : "+e}	${String(t).padStart(4,"0")}ms
`;this.logService.info(`[prof-timers] ${s}`)}};p=m([r(0,f),r(1,h),r(2,l),r(3,S),r(4,u),r(5,W),r(6,b),r(7,L),r(8,y),r(9,k)],p);let v=class{constructor(o){for(const e of performance.getEntriesByType("resource"))try{const t=new URL(e.name),i=w.basename(t.pathname);o.publicLog2("startup.resource.perf",{hosthash:`H${$(t.host).toString(16)}`,name:i,duration:e.duration})}catch{}}};v=m([r(0,y)],v);export{v as BrowserResourcePerformanceMarks,p as BrowserStartupTimings,c as StartupTimings};
