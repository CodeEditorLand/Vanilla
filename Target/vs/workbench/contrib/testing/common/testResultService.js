var R=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var a=(r,n,e,t)=>{for(var s=t>1?void 0:t?c(n,e):n,i=r.length-1,o;i>=0;i--)(o=r[i])&&(s=(t?o(n,e,s):o(s))||s);return t&&s&&R(n,e,s),s},l=(r,n)=>(e,t)=>n(e,t,r);import{findFirstIdxMonotonousOrArrLen as m}from"../../../../base/common/arraysFind.js";import{RunOnceScheduler as f}from"../../../../base/common/async.js";import{Emitter as p}from"../../../../base/common/event.js";import{createSingleCallFunction as g}from"../../../../base/common/functional.js";import{Disposable as I,DisposableStore as T,dispose as v,toDisposable as y}from"../../../../base/common/lifecycle.js";import{generateUuid as S}from"../../../../base/common/uuid.js";import{IContextKeyService as C}from"../../../../platform/contextkey/common/contextkey.js";import{createDecorator as E}from"../../../../platform/instantiation/common/instantiation.js";import{ITelemetryService as b}from"../../../../platform/telemetry/common/telemetry.js";import{TestingContextKeys as h}from"./testingContextKeys.js";import{ITestProfileService as x}from"./testProfileService.js";import{LiveTestResult as d,TestResultItemChangeReason as A}from"./testResult.js";import{ITestResultStorage as _,RETAIN_MAX_RESULTS as D}from"./testResultStorage.js";import{TestResultState as L,TestRunProfileBitset as P}from"./testTypes.js";const w=r=>r.results.length>0&&r.results[0].completedAt===void 0,se=E("testResultService");let u=class extends I{constructor(e,t,s,i){super();this.storage=t;this.testProfiles=s;this.telemetryService=i;this._register(y(()=>v(this._resultsDisposables))),this.isRunning=h.isRunning.bindTo(e),this.hasAnyResults=h.hasAnyResults.bindTo(e)}changeResultEmitter=this._register(new p);_results=[];_resultsDisposables=[];testChangeEmitter=this._register(new p);get results(){return this.loadResults(),this._results}onResultsChanged=this.changeResultEmitter.event;onTestChanged=this.testChangeEmitter.event;isRunning;hasAnyResults;loadResults=g(()=>this.storage.read().then(e=>{for(let t=e.length-1;t>=0;t--)this.push(e[t])}));persistScheduler=new f(()=>this.persistImmediately(),500);getStateById(e){for(const t of this.results){const s=t.getStateById(e);if(s&&s.computedState!==L.Unset)return[t,s]}}createLiveResult(e){if("targets"in e){const i=S();return this.push(new d(i,!0,e,this.telemetryService))}let t;e.profile&&(t=this.testProfiles.getControllerProfiles(e.controllerId).find(o=>o.profileId===e.profile.id));const s={preserveFocus:e.preserveFocus,targets:[],exclude:e.exclude,continuous:e.continuous,group:t?.group??P.Run};return t&&s.targets.push({profileId:t.profileId,controllerId:e.controllerId,testIds:e.include}),this.push(new d(e.id,e.persist,s,this.telemetryService))}push(e){if(e.completedAt===void 0)this.results.unshift(e);else{const s=m(this.results,i=>i.completedAt!==void 0&&i.completedAt<=e.completedAt);this.results.splice(s,0,e),this.persistScheduler.schedule()}this.hasAnyResults.set(!0),this.results.length>D&&(this.results.pop(),this._resultsDisposables.pop()?.dispose());const t=new T;if(this._resultsDisposables.push(t),e instanceof d)t.add(e),t.add(e.onComplete(()=>this.onComplete(e))),t.add(e.onChange(this.testChangeEmitter.fire,this.testChangeEmitter)),this.isRunning.set(!0),this.changeResultEmitter.fire({started:e});else{this.changeResultEmitter.fire({inserted:e});for(const s of e.tests)for(const i of this.results)if(i===e){this.testChangeEmitter.fire({item:s,result:e,reason:A.ComputedStateChange});break}else if(i.getStateById(s.item.extId)!==void 0)break}return e}getResult(e){return this.results.find(t=>t.id===e)}clear(){const e=[],t=[];for(const s of this.results)s.completedAt!==void 0?t.push(s):e.push(s);this._results=e,this.persistScheduler.schedule(),e.length===0&&this.hasAnyResults.set(!1),this.changeResultEmitter.fire({removed:t})}onComplete(e){this.resort(),this.updateIsRunning(),this.persistScheduler.schedule(),this.changeResultEmitter.fire({completed:e})}resort(){this.results.sort((e,t)=>(t.completedAt??Number.MAX_SAFE_INTEGER)-(e.completedAt??Number.MAX_SAFE_INTEGER))}updateIsRunning(){this.isRunning.set(w(this))}async persistImmediately(){await this.loadResults(),this.storage.persist(this.results)}};u=a([l(0,C),l(1,_),l(2,x),l(3,b)],u);export{se as ITestResultService,u as TestResultService};
