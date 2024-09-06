var J=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var A=(T,s,e,t)=>{for(var r=t>1?void 0:t?X(s,e):s,n=T.length-1,o;n>=0;n--)(o=T[n])&&(r=(t?o(s,e,r):o(r))||r);return t&&r&&J(s,e,r),r},C=(T,s)=>(e,t)=>s(e,t,T);import{RunOnceScheduler as Y}from"../../../../vs/base/common/async.js";import{VSBuffer as Z}from"../../../../vs/base/common/buffer.js";import{CancellationToken as _,CancellationTokenSource as P}from"../../../../vs/base/common/cancellation.js";import{Emitter as R,Event as k}from"../../../../vs/base/common/event.js";import{createSingleCallFunction as ee}from"../../../../vs/base/common/functional.js";import{hash as te}from"../../../../vs/base/common/hash.js";import{Disposable as B,DisposableStore as re,toDisposable as S}from"../../../../vs/base/common/lifecycle.js";import{MarshalledId as D}from"../../../../vs/base/common/marshallingIds.js";import{isDefined as b}from"../../../../vs/base/common/types.js";import{URI as se}from"../../../../vs/base/common/uri.js";import{generateUuid as O}from"../../../../vs/base/common/uuid.js";import"../../../../vs/editor/common/core/position.js";import"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as oe}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as ne}from"../../../../vs/platform/log/common/log.js";import{MainContext as ie}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{IExtHostCommands as ae}from"../../../../vs/workbench/api/common/extHostCommands.js";import{IExtHostDocumentsAndEditors as le}from"../../../../vs/workbench/api/common/extHostDocumentsAndEditors.js";import{IExtHostRpcService as de}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{ExtHostTestItemCollection as ce,TestItemImpl as z,TestItemRootImpl as ue,toItemFromContext as L}from"../../../../vs/workbench/api/common/extHostTestItem.js";import*as g from"../../../../vs/workbench/api/common/extHostTypeConverters.js";import{FileCoverage as K,TestRunProfileKind as M,TestRunRequest as pe}from"../../../../vs/workbench/api/common/extHostTypes.js";import{TestCommandId as fe}from"../../../../vs/workbench/contrib/testing/common/constants.js";import{TestId as h,TestPosition as he}from"../../../../vs/workbench/contrib/testing/common/testId.js";import{InvalidTestItemError as Te}from"../../../../vs/workbench/contrib/testing/common/testItemCollection.js";import{AbstractIncrementalTestCollection as me,isStartControllerTests as ge,TestControllerCapability as $,TestResultState as I,TestRunProfileBitset as H,TestsDiffOp as U}from"../../../../vs/workbench/contrib/testing/common/testTypes.js";import{checkProposedApiEnabled as q}from"../../../../vs/workbench/services/extensions/common/extensions.js";let ve=0;const N=new WeakMap,bt=oe("IExtHostTesting");let w=class extends B{constructor(e,t,r,n){super();this.logService=t;this.commands=r;this.editors=n;this.proxy=e.getProxy(ie.MainThreadTesting),this.observer=new we(this.proxy),this.runTracker=new be(this.proxy,t),r.registerArgumentProcessor({processArgument:o=>{switch(o?.$mid){case D.TestItemContext:{const i=o,a=i.tests[i.tests.length-1].item.extId;return this.controllers.get(h.root(a))?.collection.tree.get(a)?.actual??L(o)}case D.TestMessageMenuArgs:{const{test:i,message:a}=o,u=i.item.extId;return{test:this.controllers.get(h.root(u))?.collection.tree.get(u)?.actual??L({$mid:D.TestItemContext,tests:[i]}),message:g.TestMessage.to(a)}}default:return o}}}),r.registerCommand(!1,"testing.getExplorerSelection",async()=>{const o=await r.executeCommand(fe.GetExplorerSelection),i=a=>{const u=this.controllers.get(h.root(a));if(u)return h.isRoot(a)?u.controller:u.collection.tree.get(a)?.actual};return{include:o?.include.map(i).filter(b)||[],exclude:o?.exclude.map(i).filter(b)||[]}})}resultsChangedEmitter=this._register(new R);controllers=new Map;proxy;runTracker;observer;defaultProfilesChangedEmitter=this._register(new R);followupProviders=new Set;testFollowups=new Map;onResultsChanged=this.resultsChangedEmitter.event;results=[];createTestController(e,t,r,n){if(this.controllers.has(t))throw new Error(`Attempt to insert a duplicate controller with ID "${t}"`);const o=new re,i=o.add(new ce(t,r,this.editors));i.root.label=r;const a=new Map,u=new Set,c=this.proxy,d=()=>{let l=0;n&&(l|=$.Refresh);const m=f.relatedCodeProvider;return m&&(m?.provideRelatedTests&&(l|=$.TestRelatedToCode),m?.provideRelatedCode&&(l|=$.CodeRelatedToTest)),l},p={items:i.root.children,get label(){return r},set label(l){r=l,i.root.label=l,c.$updateController(t,{label:r})},get refreshHandler(){return n},set refreshHandler(l){n=l,c.$updateController(t,{capabilities:d()})},get id(){return t},get relatedCodeProvider(){return f.relatedCodeProvider},set relatedCodeProvider(l){q(e,"testRelatedCode"),f.relatedCodeProvider=l,c.$updateController(t,{capabilities:d()})},createRunProfile:(l,m,v,W,Q,V)=>{let E=te(l);for(;a.has(E);)E++;return new G(this.proxy,a,u,this.defaultProfilesChangedEmitter.event,t,E,l,m,v,W,Q,V)},createTestItem(l,m,v){return new z(t,l,m,v)},createTestRun:(l,m,v=!0)=>this.runTracker.createTestRun(e,t,i,l,m,v),invalidateTestResults:l=>{if(l===void 0)this.proxy.$markTestRetired(void 0);else{const m=l instanceof Array?l:[l];this.proxy.$markTestRetired(m.map(v=>h.fromExtHostTestItem(v,t).toString()))}},set resolveHandler(l){i.resolveHandler=l},get resolveHandler(){return i.resolveHandler},dispose:()=>{o.dispose()}},f={controller:p,collection:i,profiles:a,extension:e,activeProfiles:u};return c.$registerTestController(t,r,d()),o.add(S(()=>c.$unregisterTestController(t))),this.controllers.set(t,f),o.add(S(()=>this.controllers.delete(t))),o.add(i.onDidGenerateDiff(l=>c.$publishDiff(t,l.map(U.serialize)))),p}createTestObserver(){return this.observer.checkout()}async runTests(e,t=_.None){const r=j(e);if(!r)throw new Error("The request passed to `vscode.test.runTests` must include a profile");const n=this.controllers.get(r.controllerId);if(!n)throw new Error("Controller not found");await this.proxy.$runTests({preserveFocus:e.preserveFocus??!0,group:F[r.kind],targets:[{testIds:e.include?.map(o=>h.fromExtHostTestItem(o,n.collection.root.id).toString())??[n.collection.root.id],profileId:r.profileId,controllerId:r.controllerId}],exclude:e.exclude?.map(o=>o.id)},t)}registerTestFollowupProvider(e){return this.followupProviders.add(e),{dispose:()=>{this.followupProviders.delete(e)}}}async $getTestsRelatedToCode(e,t,r){const n=this.editors.getDocument(se.revive(e));if(!n)return[];const o=g.Position.to(t),i=[];return await Promise.all([...this.controllers.values()].map(async a=>{let u;try{u=await a.relatedCodeProvider?.provideRelatedTests?.(n.document,o,r)}catch(c){r.isCancellationRequested||this.logService.warn(`Error thrown while providing related tests for ${a.controller.label}`,c)}if(u){for(const c of u)i.push(h.fromExtHostTestItem(c,a.controller.id).toString());a.collection.flushDiff()}})),i}async $getCodeRelatedToTest(e,t){const r=this.controllers.get(h.root(e));if(!r)return[];const n=r.collection.tree.get(e);return n?(await r.relatedCodeProvider?.provideRelatedCode?.(n.actual,t))?.map(g.location.from)??[]:[]}$syncTests(){for(const{collection:e}of this.controllers.values())e.flushDiff();return Promise.resolve()}async $getCoverageDetails(e,t,r){return(await this.runTracker.getCoverageDetails(e,t,r))?.map(g.TestCoverage.fromDetails)}async $disposeRun(e){this.runTracker.disposeTestRun(e)}$configureRunProfile(e,t){this.controllers.get(e)?.profiles.get(t)?.configureHandler?.()}$setDefaultRunProfiles(e){const t=new Map;for(const[r,n]of Object.entries(e)){const o=this.controllers.get(r);if(!o)continue;const i=new Map,a=n.filter(c=>!o.activeProfiles.has(c)),u=[...o.activeProfiles].filter(c=>!n.includes(c));for(const c of a)i.set(c,!0),o.activeProfiles.add(c);for(const c of u)i.set(c,!1),o.activeProfiles.delete(c);i.size&&t.set(r,i)}this.defaultProfilesChangedEmitter.fire(t)}async $refreshTests(e,t){await this.controllers.get(e)?.controller.refreshHandler?.(t)}$publishTestResults(e){this.results=Object.freeze(e.map(t=>{const r=g.TestResults.to(t),n=t.tasks.findIndex(o=>o.hasCoverage);return n!==-1&&(r.getDetailedCoverage=(o,i=_.None)=>this.proxy.$getCoverageDetails(t.id,n,o,i).then(a=>a.map(g.TestCoverage.to))),N.set(r,t.id),r}).concat(this.results).sort((t,r)=>r.completedAt-t.completedAt).slice(0,32)),this.resultsChangedEmitter.fire()}async $expandTest(e,t){const r=this.controllers.get(h.fromString(e).controllerId)?.collection;r&&(await r.expand(e,t<0?1/0:t),r.flushDiff())}$acceptDiff(e){this.observer.applyDiff(e.map(t=>U.deserialize({asCanonicalUri:r=>r},t)))}async $runControllerTests(e,t){return Promise.all(e.map(r=>this.runControllerTestRequest(r,!1,t)))}async $startContinuousRun(e,t){const r=new P(t),n=await Promise.all(e.map(o=>this.runControllerTestRequest(o,!0,r.token)));return!t.isCancellationRequested&&!n.some(o=>o.error)&&await new Promise(o=>t.onCancellationRequested(o)),r.dispose(!0),n}async $provideTestFollowups(e,t){const r=this.results.find(i=>N.get(i)===e.resultId),n=r&&Ee(h.fromString(e.extId),r?.results);if(!n)return[];let o=[];return await Promise.all([...this.followupProviders].map(async i=>{try{const a=await i.provideFollowup(r,n,e.taskIndex,e.messageIndex,t);a&&(o=o.concat(a))}catch(a){this.logService.error("Error thrown while providing followup for test message",a)}})),t.isCancellationRequested?[]:o.map(i=>{const a=ve++;return this.testFollowups.set(a,i),{title:i.title,id:a}})}$disposeTestFollowups(e){for(const t of e)this.testFollowups.delete(t)}$executeTestFollowup(e){const t=this.testFollowups.get(e);return t?this.commands.executeCommand(t.command,...t.arguments||[]):Promise.resolve()}$cancelExtensionTestRun(e,t){e===void 0?this.runTracker.cancelAllRuns():this.runTracker.cancelRunById(e,t)}getMetadataForRun(e){for(const t of this.runTracker.trackers){const r=t.getTaskIdForRun(e);if(r)return{taskId:r,runId:t.id}}}async runControllerTestRequest(e,t,r){const n=this.controllers.get(e.controllerId);if(!n)return{};const{collection:o,profiles:i,extension:a}=n,u=i.get(e.profileId);if(!u)return{};const c=e.testIds.map(l=>o.tree.get(l)).filter(b),d=e.excludeExtIds.map(l=>n.collection.tree.get(l)).filter(b).filter(l=>c.some(m=>m.fullId.compare(l.fullId)===he.IsChild));if(!c.length)return{};const p=new pe(c.some(l=>l.actual instanceof ue)?void 0:c.map(l=>l.actual),d.map(l=>l.actual),u,t),f=ge(e)&&this.runTracker.prepareForMainThreadTestRun(a,p,x.fromInternal(e,n.collection),u,r);try{return await u.runHandler(p,r),{}}catch(l){return{error:String(l)}}finally{f&&f.hasRunningTasks&&!r.isCancellationRequested&&await k.toPromise(f.onEnd)}}};w=A([C(0,de),C(1,ne),C(2,ae),C(3,le)],w);const Ie=1e4;var Ce=(t=>(t[t.Running=0]="Running",t[t.Cancelling=1]="Cancelling",t[t.Ended=2]="Ended",t))(Ce||{});class Re extends B{constructor(e,t,r,n,o,i){super();this.dto=e;this.proxy=t;this.logService=r;this.profile=n;this.extension=o;this.cts=this._register(new P(i));const a=this._register(new Y(()=>this.forciblyEndTasks(),Ie));this._register(this.cts.token.onCancellationRequested(()=>a.schedule()));const u=new R;this.onDidDispose=u.event,this._register(S(()=>{u.fire(),u.dispose()}))}state=0;running=0;tasks=new Map;sharedTestIds=new Set;cts;endEmitter=this._register(new R);onDidDispose;publishedCoverage=new Map;onEnd=this.endEmitter.event;get hasRunningTasks(){return this.running>0}get id(){return this.dto.id}getTaskIdForRun(e){for(const[t,{run:r}]of this.tasks)if(r===e)return t}cancel(e){e?this.tasks.get(e)?.cts.cancel():this.state===0?(this.cts.cancel(),this.state=1):this.state===1&&this.forciblyEndTasks()}async getCoverageDetails(e,t,r){const[,n]=h.fromString(e).path,o=this.publishedCoverage.get(e);if(!o)return[];const{report:i,extIds:a}=o,u=this.tasks.get(n);if(!u)throw new Error("unreachable: run task was not found");let c;if(t&&i instanceof K){const p=a.indexOf(t);if(p===-1)return[];c=i.fromTests[p]}return await(c?this.profile?.loadDetailedCoverageForTest?.(u.run,i,c,r):this.profile?.loadDetailedCoverage?.(u.run,i,r))??[]}createRun(e){const t=this.dto.id,r=this.dto.controllerId,n=O(),o=d=>(p,...f)=>{if(a){this.logService.warn(`Setting the state of test "${p.id}" is a no-op after the run ends.`);return}this.ensureTestIsKnown(p),d(p,...f)},i=(d,p)=>{const f=p instanceof Array?p.map(g.TestMessage.from):[g.TestMessage.from(p)];if(d.uri&&d.range){const l={range:g.Range.from(d.range),uri:d.uri};for(const m of f)m.location=m.location||l}this.proxy.$appendTestMessagesInRun(t,n,h.fromExtHostTestItem(d,r).toString(),f)};let a=!1;const u=this._register(new P(this.cts.token)),c={isPersisted:this.dto.isPersisted,token:u.token,name:e,onDidDispose:this.onDidDispose,addCoverage:d=>{if(a)return;const p=d instanceof K?d.fromTests:[];if(p.length){q(this.extension,"attributableCoverage");for(const m of p)this.ensureTestIsKnown(m)}const f=d.uri.toString(),l=new h([t,n,f]).toString();this.publishedCoverage.set(l,{report:d,extIds:p.map(m=>h.fromExtHostTestItem(m,r).toString())}),this.proxy.$appendCoverage(t,n,g.TestCoverage.fromFile(r,l,d))},enqueued:o(d=>{this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,r).toString(),I.Queued)}),skipped:o(d=>{this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,r).toString(),I.Skipped)}),started:o(d=>{this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,r).toString(),I.Running)}),errored:o((d,p,f)=>{i(d,p),this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,r).toString(),I.Errored,f)}),failed:o((d,p,f)=>{i(d,p),this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,r).toString(),I.Failed,f)}),passed:o((d,p)=>{this.proxy.$updateTestStateInRun(t,n,h.fromExtHostTestItem(d,this.dto.controllerId).toString(),I.Passed,p)}),appendOutput:(d,p,f)=>{a||(f&&this.ensureTestIsKnown(f),this.proxy.$appendOutputToRun(t,n,Z.fromString(d),p&&g.location.from(p),f&&h.fromExtHostTestItem(f,r).toString()))},end:()=>{a||(a=!0,this.proxy.$finishedTestRunTask(t,n),--this.running||this.markEnded())}};return this.running++,this.tasks.set(n,{run:c,cts:u}),this.proxy.$startedTestRunTask(t,{id:n,ctrlId:this.dto.controllerId,name:e||this.extension.displayName||this.extension.identifier.value,running:!0}),c}forciblyEndTasks(){for(const{run:e}of this.tasks.values())e.end()}markEnded(){this.state!==2&&(this.state=2,this.endEmitter.fire())}ensureTestIsKnown(e){if(!(e instanceof z))throw new Te(e.id);if(this.sharedTestIds.has(h.fromExtHostTestItem(e,this.dto.controllerId).toString()))return;const t=[],r=this.dto.colllection.root;for(;;){const n=g.TestItem.from(e);if(t.unshift(n),this.sharedTestIds.has(n.extId)||(this.sharedTestIds.add(n.extId),e===r))break;e=e.parent||r}this.proxy.$addTestsToRun(this.dto.controllerId,this.dto.id,t)}dispose(){this.markEnded(),super.dispose()}}class be{constructor(s,e){this.proxy=s;this.logService=e}tracked=new Map;trackedById=new Map;get trackers(){return this.tracked.values()}getCoverageDetails(s,e,t){const r=h.root(s);return this.trackedById.get(r)?.getCoverageDetails(s,e,t)||[]}disposeTestRun(s){this.trackedById.get(s)?.dispose(),this.trackedById.delete(s);for(const[e,{id:t}]of this.tracked)t===s&&this.tracked.delete(e)}prepareForMainThreadTestRun(s,e,t,r,n){return this.getTracker(e,t,r,s,n)}cancelRunById(s,e){this.trackedById.get(s)?.cancel(e)}cancelAllRuns(){for(const s of this.tracked.values())s.cancel()}createTestRun(s,e,t,r,n,o){const i=this.tracked.get(r);if(i)return i.createRun(n);const a=x.fromPublic(e,t,r,o),u=j(r);this.proxy.$startedExtensionTestRun({controllerId:e,continuous:!!r.continuous,profile:u&&{group:F[u.kind],id:u.profileId},exclude:r.exclude?.map(d=>h.fromExtHostTestItem(d,t.root.id).toString())??[],id:a.id,include:r.include?.map(d=>h.fromExtHostTestItem(d,t.root.id).toString())??[t.root.id],preserveFocus:r.preserveFocus??!0,persist:o});const c=this.getTracker(r,a,r.profile,s);return k.once(c.onEnd)(()=>{this.proxy.$finishedExtensionTestRun(a.id)}),c.createRun(n)}getTracker(s,e,t,r,n){const o=new Re(e,this.proxy,this.logService,t,r,n);return this.tracked.set(s,o),this.trackedById.set(o.id,o),o}}const j=T=>{if(T.profile){if(!(T.profile instanceof G))throw new Error("TestRunRequest.profile is not an instance created from TestController.createRunProfile");return T.profile}};class x{constructor(s,e,t,r){this.controllerId=s;this.id=e;this.isPersisted=t;this.colllection=r}static fromPublic(s,e,t,r){return new x(s,O(),r,e)}static fromInternal(s,e){return new x(s.controllerId,s.runId,!0,e)}}class ye{constructor(s){this.emitter=s}added=new Set;updated=new Set;removed=new Set;alreadyRemoved=new Set;get isEmpty(){return this.added.size===0&&this.removed.size===0&&this.updated.size===0}add(s){this.added.add(s)}update(s){Object.assign(s.revived,g.TestItem.toPlain(s.item)),this.added.has(s)||this.updated.add(s)}remove(s){if(this.added.has(s)){this.added.delete(s);return}this.updated.delete(s);const e=h.parentId(s.item.extId);if(e&&this.alreadyRemoved.has(e.toString())){this.alreadyRemoved.add(s.item.extId);return}this.removed.add(s)}getChangeEvent(){const{added:s,updated:e,removed:t}=this;return{get added(){return[...s].map(r=>r.revived)},get updated(){return[...e].map(r=>r.revived)},get removed(){return[...t].map(r=>r.revived)}}}complete(){this.isEmpty||this.emitter.fire(this.getChangeEvent())}}class xe extends me{changeEmitter=new R;onDidChangeTests=this.changeEmitter.event;get rootTests(){return this.roots}getMirroredTestDataById(s){return this.items.get(s)}getMirroredTestDataByReference(s){return this.items.get(s.id)}createItem(s,e){return{...s,revived:g.TestItem.toPlain(s.item),depth:e?e.depth+1:0,children:new Set}}createChangeCollector(){return new ye(this.changeEmitter)}}class we{constructor(s){this.proxy=s}current;checkout(){this.current||(this.current=this.createObserverData());const s=this.current;return s.observers++,{onDidChangeTest:s.tests.onDidChangeTests,get tests(){return[...s.tests.rootTests].map(e=>e.revived)},dispose:ee(()=>{--s.observers===0&&(this.proxy.$unsubscribeFromDiffs(),this.current=void 0)})}}getMirroredTestDataByReference(s){return this.current?.tests.getMirroredTestDataByReference(s)}applyDiff(s){this.current?.tests.apply(s)}createObserverData(){const s=new xe({asCanonicalUri:e=>e});return this.proxy.$subscribeToDiffs(),{observers:0,tests:s}}}const y=(T,s,e,t)=>{e?Object.assign(e,t):s.$updateTestRunConfig(T.controllerId,T.profileId,t)};class G{constructor(s,e,t,r,n,o,i,a,u,c=!1,d=void 0,p=!1){this.controllerId=n;this.profileId=o;this._label=i;this.kind=a;this.runHandler=u;this._tag=d;this._supportsContinuousRun=p;this.#t=s,this.#s=e,this.#r=t,this.#o=r,e.set(o,this);const f=F[a];if(typeof f!="number")throw new Error(`Unknown TestRunProfile.group ${a}`);c&&t.add(o),this.#e={profileId:o,controllerId:n,tag:d?g.TestTag.namespace(this.controllerId,d.id):null,label:i,group:f,isDefault:c,hasConfigurationHandler:!1,supportsContinuousRun:p},queueMicrotask(()=>{this.#e&&(this.#t.$publishTestRunProfile(this.#e),this.#e=void 0)})}#t;#r;#o;#e;#s;_configureHandler;get label(){return this._label}set label(s){s!==this._label&&(this._label=s,y(this,this.#t,this.#e,{label:s}))}get supportsContinuousRun(){return this._supportsContinuousRun}set supportsContinuousRun(s){s!==this._supportsContinuousRun&&(this._supportsContinuousRun=s,y(this,this.#t,this.#e,{supportsContinuousRun:s}))}get isDefault(){return this.#r.has(this.profileId)}set isDefault(s){s!==this.isDefault&&(s?this.#r.add(this.profileId):this.#r.delete(this.profileId),y(this,this.#t,this.#e,{isDefault:s}))}get tag(){return this._tag}set tag(s){s?.id!==this._tag?.id&&(this._tag=s,y(this,this.#t,this.#e,{tag:s?g.TestTag.namespace(this.controllerId,s.id):null}))}get configureHandler(){return this._configureHandler}set configureHandler(s){s!==this._configureHandler&&(this._configureHandler=s,y(this,this.#t,this.#e,{hasConfigurationHandler:!!s}))}get onDidChangeDefault(){return k.chain(this.#o,s=>s.map(e=>e.get(this.controllerId)?.get(this.profileId)).filter(b))}dispose(){this.#s?.delete(this.profileId)&&(this.#s=void 0,this.#t.$removeTestProfile(this.controllerId,this.profileId)),this.#e=void 0}}const F={[M.Coverage]:H.Coverage,[M.Debug]:H.Debug,[M.Run]:H.Run};function Ee(T,s){for(let e=0;e<T.path.length;e++){const t=s.find(r=>r.id===T.path[e]);if(!t)return;if(e===T.path.length-1)return t;s=t.children}}export{w as ExtHostTesting,bt as IExtHostTesting,be as TestRunCoordinator,x as TestRunDto,G as TestRunProfileImpl};
