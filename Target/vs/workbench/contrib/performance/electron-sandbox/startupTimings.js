var g=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var l=(m,p,e,r)=>{for(var t=r>1?void 0:r?y(p,e):p,a=m.length-1,i;a>=0;a--)(i=m[a])&&(t=(r?i(p,e,t):i(t))||t);return r&&t&&g(p,e,t),t},s=(m,p)=>(e,r)=>p(e,r,m);import"../../../common/contributions.js";import{timeout as b}from"../../../../base/common/async.js";import{onUnexpectedError as h}from"../../../../base/common/errors.js";import{INativeWorkbenchEnvironmentService as H}from"../../../services/environment/electron-sandbox/environmentService.js";import{ILifecycleService as I}from"../../../services/lifecycle/common/lifecycle.js";import{IProductService as C}from"../../../../platform/product/common/productService.js";import{ITelemetryService as M}from"../../../../platform/telemetry/common/telemetry.js";import{IUpdateService as w}from"../../../../platform/update/common/update.js";import{INativeHostService as G}from"../../../../platform/native/common/native.js";import{IEditorService as k}from"../../../services/editor/common/editorService.js";import{ITimerService as P}from"../../../services/timer/browser/timerService.js";import{IFileService as B}from"../../../../platform/files/common/files.js";import{URI as f}from"../../../../base/common/uri.js";import{VSBuffer as _}from"../../../../base/common/buffer.js";import{IWorkspaceTrustManagementService as j}from"../../../../platform/workspace/common/workspaceTrust.js";import{IPaneCompositePartService as D}from"../../../services/panecomposite/browser/panecomposite.js";import{StartupTimings as A}from"../browser/startupTimings.js";import{coalesce as E}from"../../../../base/common/arrays.js";let v=class extends A{constructor(e,r,t,a,i,c,o,n,u,d,S){super(a,i,o,n,S);this._fileService=e;this._timerService=r;this._nativeHostService=t;this._telemetryService=c;this._environmentService=u;this._productService=d;this._report().catch(h)}async _report(){const e=await this._isStandardStartup();this._appendStartupTimes(e).catch(h)}async _appendStartupTimes(e){const r=this._environmentService.args["prof-append-timers"],t=this._environmentService.args["prof-duration-markers"],a=this._environmentService.args["prof-duration-markers-file"];if(!(!r&&!t))try{await Promise.all([this._timerService.whenReady(),b(15e3)]);const i=await this._timerService.perfBaseline,c=await this._resolveStartupHeapStatistics();if(c&&this._telemetryLogHeapStatistics(c),r){const o=E([this._timerService.startupMetrics.ellapsed,this._productService.nameShort,(this._productService.commit||"").slice(0,10)||"0000000000",this._telemetryService.sessionId,e===void 0?"standard_start":`NO_standard_start : ${e}`,`${String(i).padStart(4,"0")}ms`,c?this._printStartupHeapStatistics(c):void 0]).join("	")+`
`;await this._appendContent(f.file(r),o)}if(t?.length){const o=[];for(const u of t){let d=0;if(u==="ellapsed")d=this._timerService.startupMetrics.ellapsed;else if(u.indexOf("-")!==-1){const S=u.split("-");S.length===2&&(d=this._timerService.getDuration(S[0],S[1]))}d&&(o.push(u),o.push(`${d}`))}const n=`${o.join("	")}
`;a?await this._appendContent(f.file(a),n):console.log(n)}}catch(i){console.error(i)}finally{this._nativeHostService.exit(0)}}async _isStandardStartup(){const e=await this._nativeHostService.getWindowCount();return e!==1?`Expected window count : 1, Actual : ${e}`:super._isStandardStartup()}async _appendContent(e,r){const t=[];await this._fileService.exists(e)&&t.push((await this._fileService.readFile(e)).value),t.push(_.fromString(r)),await this._fileService.writeFile(e,_.concat(t))}async _resolveStartupHeapStatistics(){if(!this._environmentService.args["enable-tracing"]||!this._environmentService.args["trace-startup-file"]||this._environmentService.args["trace-startup-format"]!=="json"||!this._environmentService.args["trace-startup-duration"])return;const e=await this._nativeHostService.getProcessId(),r=performance.memory?.usedJSHeapSize??0;let t=0,a=0,i=0,c=0;try{const o=JSON.parse((await this._fileService.readFile(f.file(this._environmentService.args["trace-startup-file"]))).value.toString());for(const n of o.traceEvents)if(n.pid===e){switch(n.name){case"MinorGC":t++;break;case"MajorGC":a++;break;case"V8.GCFinalizeMC":case"V8.GCScavenger":c+=n.dur;break}(n.name==="MajorGC"||n.name==="MinorGC")&&typeof n.args?.usedHeapSizeAfter=="number"&&typeof n.args.usedHeapSizeBefore=="number"&&(i+=n.args.usedHeapSizeBefore-n.args.usedHeapSizeAfter)}return{minorGCs:t,majorGCs:a,used:r,garbage:i,duration:Math.round(c/1e3)}}catch(o){console.error(o)}}_telemetryLogHeapStatistics({used:e,garbage:r,majorGCs:t,minorGCs:a,duration:i}){this._telemetryService.publicLog2("startupHeapStatistics",{heapUsed:e,heapGarbage:r,majorGCs:t,minorGCs:a,gcsDuration:i})}_printStartupHeapStatistics({used:e,garbage:r,majorGCs:t,minorGCs:a,duration:i}){return`Heap: ${Math.round(e/1048576)}MB (used) ${Math.round(r/1048576)}MB (garbage) ${t} (MajorGC) ${a} (MinorGC) ${i}ms (GC duration)`}};v=l([s(0,B),s(1,P),s(2,G),s(3,k),s(4,D),s(5,M),s(6,I),s(7,w),s(8,H),s(9,C),s(10,j)],v);export{v as NativeStartupTimings};
