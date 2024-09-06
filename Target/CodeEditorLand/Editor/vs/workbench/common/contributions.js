import{DeferredPromise as S,runWhenGlobalIdle as l}from"../../base/common/async.js";import{Disposable as k,DisposableStore as p,isDisposable as W}from"../../base/common/lifecycle.js";import{getOrSet as v}from"../../base/common/map.js";import{mark as u}from"../../base/common/performance.js";import{IEnvironmentService as E}from"../../platform/environment/common/environment.js";import{IInstantiationService as R}from"../../platform/instantiation/common/instantiation.js";import{ILogService as m}from"../../platform/log/common/log.js";import{Registry as B}from"../../platform/registry/common/platform.js";import{IEditorPaneService as P}from"../services/editor/common/editorPaneService.js";import{ILifecycleService as w,LifecyclePhase as s}from"../services/lifecycle/common/lifecycle.js";var y;(t=>t.Workbench="workbench.contributions.kind")(y||={});var h=(e=>(e[e.BlockStartup=s.Starting]="BlockStartup",e[e.BlockRestore=s.Ready]="BlockRestore",e[e.AfterRestored=s.Restored]="AfterRestored",e[e.Eventually=s.Eventually]="Eventually",e))(h||{});function I(b){const t=b;return!!t&&typeof t.editorTypeId=="string"}function L(b){switch(b){case s.Restored:return h.AfterRestored;case s.Eventually:return h.Eventually}}function f(b){switch(b){case h.BlockStartup:return s.Starting;case h.BlockRestore:return s.Ready;case h.AfterRestored:return s.Restored;case h.Eventually:return s.Eventually}}class a extends k{static INSTANCE=new a;static BLOCK_BEFORE_RESTORE_WARN_THRESHOLD=20;static BLOCK_AFTER_RESTORE_WARN_THRESHOLD=100;instantiationService;lifecycleService;logService;environmentService;editorPaneService;contributionsByPhase=new Map;contributionsByEditor=new Map;contributionsById=new Map;instancesById=new Map;instanceDisposables=this._register(new p);timingsByPhase=new Map;get timings(){return this.timingsByPhase}pendingRestoredContributions=new S;whenRestored=this.pendingRestoredContributions.p;registerWorkbenchContribution2(t,o,i){const e={id:t,ctor:o};this.instantiationService&&this.lifecycleService&&this.logService&&this.environmentService&&this.editorPaneService&&(typeof i=="number"&&this.lifecycleService.phase>=i||typeof t=="string"&&I(i)&&this.editorPaneService.didInstantiateEditorPane(i.editorTypeId))?this.safeCreateContribution(this.instantiationService,this.logService,this.environmentService,e,typeof i=="number"?f(i):this.lifecycleService.phase):(typeof i=="number"&&v(this.contributionsByPhase,f(i),[]).push(e),typeof t=="string"&&(this.contributionsById.has(t)?console.error(`IWorkbenchContributionsRegistry#registerWorkbenchContribution(): Can't register multiple contributions with same id '${t}'`):this.contributionsById.set(t,e),I(i)&&v(this.contributionsByEditor,i.editorTypeId,[]).push(e)))}registerWorkbenchContribution(t,o){this.registerWorkbenchContribution2(void 0,t,L(o))}getWorkbenchContribution(t){if(this.instancesById.has(t))return this.instancesById.get(t);const o=this.instantiationService,i=this.lifecycleService,e=this.logService,n=this.environmentService;if(!o||!i||!e||!n)throw new Error(`IWorkbenchContributionsRegistry#getContribution('${t}'): cannot be called before registry started`);const c=this.contributionsById.get(t);if(!c)throw new Error(`IWorkbenchContributionsRegistry#getContribution('${t}'): contribution with that identifier is unknown.`);i.phase<s.Restored&&e.warn(`IWorkbenchContributionsRegistry#getContribution('${t}'): contribution instantiated before LifecyclePhase.Restored!`),this.safeCreateContribution(o,e,n,c,i.phase);const r=this.instancesById.get(t);if(!r)throw new Error(`IWorkbenchContributionsRegistry#getContribution('${t}'): failed to create contribution.`);return r}start(t){const o=this.instantiationService=t.get(R),i=this.lifecycleService=t.get(w),e=this.logService=t.get(m),n=this.environmentService=t.get(E),c=this.editorPaneService=t.get(P);this._register(i.onDidShutdown(()=>{this.instanceDisposables.clear()}));for(const r of[s.Starting,s.Ready,s.Restored,s.Eventually])this.instantiateByPhase(o,i,e,n,r);for(const r of this.contributionsByEditor.keys())c.didInstantiateEditorPane(r)&&this.onEditor(r,o,i,e,n);this._register(c.onWillInstantiateEditorPane(r=>this.onEditor(r.typeId,o,i,e,n)))}onEditor(t,o,i,e,n){const c=this.contributionsByEditor.get(t);if(c){this.contributionsByEditor.delete(t);for(const r of c)this.safeCreateContribution(o,e,n,r,i.phase)}}instantiateByPhase(t,o,i,e,n){o.phase>=n?this.doInstantiateByPhase(t,i,e,n):o.when(n).then(()=>this.doInstantiateByPhase(t,i,e,n))}async doInstantiateByPhase(t,o,i,e){const n=this.contributionsByPhase.get(e);if(n)switch(this.contributionsByPhase.delete(e),e){case s.Starting:case s.Ready:{u(`code/willCreateWorkbenchContributions/${e}`);for(const c of n)this.safeCreateContribution(t,o,i,c,e);u(`code/didCreateWorkbenchContributions/${e}`);break}case s.Restored:case s.Eventually:{e===s.Eventually&&await this.pendingRestoredContributions.p,this.doInstantiateWhenIdle(n,t,o,i,e);break}}}doInstantiateWhenIdle(t,o,i,e,n){u(`code/willCreateWorkbenchContributions/${n}`);let c=0;const r=n===s.Eventually?3e3:500,d=g=>{for(;c<t.length;){const C=t[c++];if(this.safeCreateContribution(o,i,e,C,n),g.timeRemaining()<1){l(d,r);break}}c===t.length&&(u(`code/didCreateWorkbenchContributions/${n}`),n===s.Restored&&this.pendingRestoredContributions.complete())};l(d,r)}safeCreateContribution(t,o,i,e,n){if(typeof e.id=="string"&&this.instancesById.has(e.id))return;const c=Date.now();try{typeof e.id=="string"&&u(`code/willCreateWorkbenchContribution/${n}/${e.id}`);const r=t.createInstance(e.ctor);typeof e.id=="string"&&(this.instancesById.set(e.id,r),this.contributionsById.delete(e.id)),W(r)&&this.instanceDisposables.add(r)}catch(r){o.error(`Unable to create workbench contribution '${e.id??e.ctor.name}'.`,r)}finally{typeof e.id=="string"&&u(`code/didCreateWorkbenchContribution/${n}/${e.id}`)}if(typeof e.id=="string"||!i.isBuilt){const r=Date.now()-c;if(r>(n<s.Restored?a.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD:a.BLOCK_AFTER_RESTORE_WARN_THRESHOLD)&&o.warn(`Creation of workbench contribution '${e.id??e.ctor.name}' took ${r}ms.`),typeof e.id=="string"){let d=this.timingsByPhase.get(n);d||(d=[],this.timingsByPhase.set(n,d)),d.push([e.id,r])}}}}const G=a.INSTANCE.registerWorkbenchContribution2.bind(a.INSTANCE),U=a.INSTANCE.getWorkbenchContribution.bind(a.INSTANCE);B.add(y.Workbench,a.INSTANCE);export{y as Extensions,a as WorkbenchContributionsRegistry,h as WorkbenchPhase,U as getWorkbenchContribution,G as registerWorkbenchContribution2};
