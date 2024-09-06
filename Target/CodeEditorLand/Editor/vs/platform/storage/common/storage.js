import{Promises as P,RunOnceScheduler as w,runWhenGlobalIdle as D}from"../../../../vs/base/common/async.js";import{Emitter as O,Event as _,PauseableEmitter as E}from"../../../../vs/base/common/event.js";import{Disposable as A,dispose as V,MutableDisposable as W}from"../../../../vs/base/common/lifecycle.js";import{mark as T}from"vs/base/common/performance";import{isUndefinedOrNull as K}from"../../../../vs/base/common/types.js";import{InMemoryStorageDatabase as S,Storage as d,StorageHint as u}from"../../../../vs/base/parts/storage/common/storage.js";import{createDecorator as N}from"../../../../vs/platform/instantiation/common/instantiation.js";import{isUserDataProfile as R}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";import"../../../../vs/platform/workspace/common/workspace.js";const L="__$__isNewStorageMarker",c="__$__targetStorageMarker",ae=N("storageService");var F=(e=>(e[e.NONE=0]="NONE",e[e.SHUTDOWN=1]="SHUTDOWN",e))(F||{}),x=(t=>(t[t.APPLICATION=-1]="APPLICATION",t[t.PROFILE=0]="PROFILE",t[t.WORKSPACE=1]="WORKSPACE",t))(x||{}),M=(e=>(e[e.USER=0]="USER",e[e.MACHINE=1]="MACHINE",e))(M||{});function U(g){const s=g.get(c);if(s)try{return JSON.parse(s)}catch{}return Object.create(null)}class h extends A{constructor(e={flushInterval:h.DEFAULT_FLUSH_INTERVAL}){super();this.options=e}static DEFAULT_FLUSH_INTERVAL=60*1e3;_onDidChangeValue=this._register(new E);_onDidChangeTarget=this._register(new E);onDidChangeTarget=this._onDidChangeTarget.event;_onWillSaveState=this._register(new O);onWillSaveState=this._onWillSaveState.event;initializationPromise;flushWhenIdleScheduler=this._register(new w(()=>this.doFlushWhenIdle(),this.options.flushInterval));runFlushWhenIdle=this._register(new W);onDidChangeValue(e,t,r){return _.filter(this._onDidChangeValue.event,a=>a.scope===e&&(t===void 0||a.key===t),r)}doFlushWhenIdle(){this.runFlushWhenIdle.value=D(()=>{this.shouldFlushWhenIdle()&&this.flush(),this.flushWhenIdleScheduler.schedule()})}shouldFlushWhenIdle(){return!0}stopFlushWhenIdle(){V([this.runFlushWhenIdle,this.flushWhenIdleScheduler])}initialize(){return this.initializationPromise||(this.initializationPromise=(async()=>{T("code/willInitStorage");try{await this.doInitialize()}finally{T("code/didInitStorage")}this.flushWhenIdleScheduler.schedule()})()),this.initializationPromise}emitDidChangeValue(e,t){const{key:r,external:a}=t;if(r===c){switch(e){case-1:this._applicationKeyTargets=void 0;break;case 0:this._profileKeyTargets=void 0;break;case 1:this._workspaceKeyTargets=void 0;break}this._onDidChangeTarget.fire({scope:e})}else this._onDidChangeValue.fire({scope:e,key:r,target:this.getKeyTargets(e)[r],external:a})}emitWillSaveState(e){this._onWillSaveState.fire({reason:e})}get(e,t,r){return this.getStorage(t)?.get(e,r)}getBoolean(e,t,r){return this.getStorage(t)?.getBoolean(e,r)}getNumber(e,t,r){return this.getStorage(t)?.getNumber(e,r)}getObject(e,t,r){return this.getStorage(t)?.getObject(e,r)}storeAll(e,t){this.withPausedEmitters(()=>{for(const r of e)this.store(r.key,r.value,r.scope,r.target,t)})}store(e,t,r,a,o=!1){if(K(t)){this.remove(e,r,o);return}this.withPausedEmitters(()=>{this.updateKeyTarget(e,r,a),this.getStorage(r)?.set(e,t,o)})}remove(e,t,r=!1){this.withPausedEmitters(()=>{this.updateKeyTarget(e,t,void 0),this.getStorage(t)?.delete(e,r)})}withPausedEmitters(e){this._onDidChangeValue.pause(),this._onDidChangeTarget.pause();try{e()}finally{this._onDidChangeValue.resume(),this._onDidChangeTarget.resume()}}keys(e,t){const r=[],a=this.getKeyTargets(e);for(const o of Object.keys(a))a[o]===t&&r.push(o);return r}updateKeyTarget(e,t,r,a=!1){const o=this.getKeyTargets(t);typeof r=="number"?o[e]!==r&&(o[e]=r,this.getStorage(t)?.set(c,JSON.stringify(o),a)):typeof o[e]=="number"&&(delete o[e],this.getStorage(t)?.set(c,JSON.stringify(o),a))}_workspaceKeyTargets=void 0;get workspaceKeyTargets(){return this._workspaceKeyTargets||(this._workspaceKeyTargets=this.loadKeyTargets(1)),this._workspaceKeyTargets}_profileKeyTargets=void 0;get profileKeyTargets(){return this._profileKeyTargets||(this._profileKeyTargets=this.loadKeyTargets(0)),this._profileKeyTargets}_applicationKeyTargets=void 0;get applicationKeyTargets(){return this._applicationKeyTargets||(this._applicationKeyTargets=this.loadKeyTargets(-1)),this._applicationKeyTargets}getKeyTargets(e){switch(e){case-1:return this.applicationKeyTargets;case 0:return this.profileKeyTargets;default:return this.workspaceKeyTargets}}loadKeyTargets(e){const t=this.getStorage(e);return t?U(t):Object.create(null)}isNew(e){return this.getBoolean(L,e)===!0}async flush(e=0){this._onWillSaveState.fire({reason:e});const t=this.getStorage(-1),r=this.getStorage(0),a=this.getStorage(1);switch(e){case 0:await P.settled([t?.whenFlushed()??Promise.resolve(),r?.whenFlushed()??Promise.resolve(),a?.whenFlushed()??Promise.resolve()]);break;case 1:await P.settled([t?.flush(0)??Promise.resolve(),r?.flush(0)??Promise.resolve(),a?.flush(0)??Promise.resolve()]);break}}async log(){const e=this.getStorage(-1)?.items??new Map,t=this.getStorage(0)?.items??new Map,r=this.getStorage(1)?.items??new Map;return j(e,t,r,this.getLogDetails(-1)??"",this.getLogDetails(0)??"",this.getLogDetails(1)??"")}async optimize(e){return await this.flush(),this.getStorage(e)?.optimize()}async switch(e,t){return this.emitWillSaveState(0),R(e)?this.switchToProfile(e,t):this.switchToWorkspace(e,t)}canSwitchProfile(e,t){return!(e.id===t.id||k(t)&&k(e))}switchData(e,t,r){this.withPausedEmitters(()=>{const a=new Set;for(const[o,l]of e)a.add(o),t.get(o)!==l&&this.emitDidChangeValue(r,{key:o,external:!0});for(const[o]of t.items)a.has(o)||this.emitDidChangeValue(r,{key:o,external:!0})})}}function k(g){return g.isDefault||!!g.useDefaultFlags?.globalState}class ie extends h{applicationStorage=this._register(new d(new S,{hint:u.STORAGE_IN_MEMORY}));profileStorage=this._register(new d(new S,{hint:u.STORAGE_IN_MEMORY}));workspaceStorage=this._register(new d(new S,{hint:u.STORAGE_IN_MEMORY}));constructor(){super(),this._register(this.workspaceStorage.onDidChangeStorage(s=>this.emitDidChangeValue(1,s))),this._register(this.profileStorage.onDidChangeStorage(s=>this.emitDidChangeValue(0,s))),this._register(this.applicationStorage.onDidChangeStorage(s=>this.emitDidChangeValue(-1,s)))}getStorage(s){switch(s){case-1:return this.applicationStorage;case 0:return this.profileStorage;default:return this.workspaceStorage}}getLogDetails(s){switch(s){case-1:return"inMemory (application)";case 0:return"inMemory (profile)";default:return"inMemory (workspace)"}}async doInitialize(){}async switchToProfile(){}async switchToWorkspace(){}shouldFlushWhenIdle(){return!1}hasScope(s){return!1}}async function j(g,s,e,t,r,a){const o=i=>{try{return JSON.parse(i)}catch{return i}},l=new Map,p=new Map;g.forEach((i,n)=>{l.set(n,i),p.set(n,o(i))});const f=new Map,I=new Map;s.forEach((i,n)=>{f.set(n,i),I.set(n,o(i))});const y=new Map,v=new Map;e.forEach((i,n)=>{y.set(n,i),v.set(n,o(i))}),console.group(t!==r?`Storage: Application (path: ${t})`:`Storage: Application & Profile (path: ${t}, default profile)`);const b=[];if(l.forEach((i,n)=>{b.push({key:n,value:i})}),console.table(b),console.groupEnd(),console.log(p),t!==r){console.group(`Storage: Profile (path: ${r}, profile specific)`);const i=[];f.forEach((n,C)=>{i.push({key:C,value:n})}),console.table(i),console.groupEnd(),console.log(I)}console.group(`Storage: Workspace (path: ${a})`);const m=[];y.forEach((i,n)=>{m.push({key:n,value:i})}),console.table(m),console.groupEnd(),console.log(v)}export{h as AbstractStorageService,L as IS_NEW_KEY,ae as IStorageService,ie as InMemoryStorageService,x as StorageScope,M as StorageTarget,c as TARGET_KEY,F as WillSaveStateReason,k as isProfileUsingDefaultStorage,U as loadKeyTargets,j as logStorage};
