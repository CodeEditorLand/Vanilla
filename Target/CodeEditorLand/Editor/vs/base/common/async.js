import{CancellationTokenSource as p}from"./cancellation.js";import{BugIndicatingError as c,CancellationError as d}from"./errors.js";import{Emitter as T,Event as h}from"./event.js";import{Disposable as k,DisposableMap as _,MutableDisposable as I,toDisposable as v}from"./lifecycle.js";import{extUri as f}from"./resources.js";import"./uri.js";import{setTimeout0 as g}from"./platform.js";import{MicrotaskDelay as w}from"./symbols.js";import{Lazy as x}from"./lazy.js";function R(s){return!!s&&typeof s.then=="function"}function D(s){const e=new p,i=s(e.token),t=new Promise((r,n)=>{const o=e.token.onCancellationRequested(()=>{o.dispose(),n(new d)});Promise.resolve(i).then(a=>{o.dispose(),e.dispose(),r(a)},a=>{o.dispose(),e.dispose(),n(a)})});return new class{cancel(){e.cancel(),e.dispose()}then(r,n){return t.then(r,n)}catch(r){return this.then(void 0,r)}finally(r){return t.finally(r)}}}function ne(s,e,i){return new Promise((t,r)=>{const n=e.onCancellationRequested(()=>{n.dispose(),t(i)});s.then(t,r).finally(()=>n.dispose())})}function oe(s,e){return new Promise((i,t)=>{const r=e.onCancellationRequested(()=>{r.dispose(),t(new d)});s.then(i,t).finally(()=>r.dispose())})}async function ae(s){let e=-1;const i=s.map((t,r)=>t.then(n=>(e=r,n)));try{return await Promise.race(i)}finally{s.forEach((t,r)=>{r!==e&&t.cancel()})}}function le(s,e,i){let t;const r=setTimeout(()=>{t?.(void 0),i?.()},e);return Promise.race([s.finally(()=>clearTimeout(r)),new Promise(n=>t=n)])}function ue(s){return new Promise((e,i)=>{const t=s();R(t)?t.then(e,i):e(t)})}function q(){let s,e;return{promise:new Promise((t,r)=>{s=t,e=r}),resolve:s,reject:e}}class C{activePromise;queuedPromise;queuedPromiseFactory;isDisposed=!1;constructor(){this.activePromise=null,this.queuedPromise=null,this.queuedPromiseFactory=null}queue(e){if(this.isDisposed)return Promise.reject(new Error("Throttler is disposed"));if(this.activePromise){if(this.queuedPromiseFactory=e,!this.queuedPromise){const i=()=>{if(this.queuedPromise=null,this.isDisposed)return;const t=this.queue(this.queuedPromiseFactory);return this.queuedPromiseFactory=null,t};this.queuedPromise=new Promise(t=>{this.activePromise.then(i,i).then(t)})}return new Promise((i,t)=>{this.queuedPromise.then(i,t)})}return this.activePromise=e(),new Promise((i,t)=>{this.activePromise.then(r=>{this.activePromise=null,i(r)},r=>{this.activePromise=null,t(r)})})}dispose(){this.isDisposed=!0}}class de{current=Promise.resolve(null);queue(e){return this.current=this.current.then(()=>e(),()=>e())}}class ce{promiseMap=new Map;queue(e,i){const r=(this.promiseMap.get(e)??Promise.resolve()).catch(()=>{}).then(i).finally(()=>{this.promiseMap.get(e)===r&&this.promiseMap.delete(e)});return this.promiseMap.set(e,r),r}}const S=(s,e)=>{let i=!0;const t=setTimeout(()=>{i=!1,e()},s);return{isTriggered:()=>i,dispose:()=>{clearTimeout(t),i=!1}}},E=s=>{let e=!0;return queueMicrotask(()=>{e&&(e=!1,s())}),{isTriggered:()=>e,dispose:()=>{e=!1}}};class O{constructor(e){this.defaultDelay=e;this.deferred=null,this.completionPromise=null,this.doResolve=null,this.doReject=null,this.task=null}deferred;completionPromise;doResolve;doReject;task;trigger(e,i=this.defaultDelay){this.task=e,this.cancelTimeout(),this.completionPromise||(this.completionPromise=new Promise((r,n)=>{this.doResolve=r,this.doReject=n}).then(()=>{if(this.completionPromise=null,this.doResolve=null,this.task){const r=this.task;return this.task=null,r()}}));const t=()=>{this.deferred=null,this.doResolve?.(null)};return this.deferred=i===w?E(t):S(i,t),this.completionPromise}isTriggered(){return!!this.deferred?.isTriggered()}cancel(){this.cancelTimeout(),this.completionPromise&&(this.doReject?.(new d),this.completionPromise=null)}cancelTimeout(){this.deferred?.dispose(),this.deferred=null}dispose(){this.cancel()}}class me{delayer;throttler;constructor(e){this.delayer=new O(e),this.throttler=new C}trigger(e,i){return this.delayer.trigger(()=>this.throttler.queue(e),i)}isTriggered(){return this.delayer.isTriggered()}cancel(){this.delayer.cancel()}dispose(){this.delayer.dispose(),this.throttler.dispose()}}class A{_isOpen;_promise;_completePromise;constructor(){this._isOpen=!1,this._promise=new Promise((e,i)=>{this._completePromise=e})}isOpen(){return this._isOpen}open(){this._isOpen=!0,this._completePromise(!0)}wait(){return this._promise}}class he extends A{_timeout;constructor(e){super(),this._timeout=setTimeout(()=>this.open(),e)}open(){clearTimeout(this._timeout),super.open()}}function P(s,e){return e?new Promise((i,t)=>{const r=setTimeout(()=>{n.dispose(),i()},s),n=e.onCancellationRequested(()=>{clearTimeout(r),n.dispose(),t(new d)})}):D(i=>P(s,i))}function pe(s,e=0,i){const t=setTimeout(()=>{s(),i&&r.dispose()},e),r=v(()=>{clearTimeout(t),i?.deleteAndLeak(r)});return i?.add(r),r}function Te(s){const e=[];let i=0;const t=s.length;function r(){return i<t?s[i++]():null}function n(o){o!=null&&e.push(o);const a=r();return a?a.then(n):Promise.resolve(e)}return Promise.resolve(null).then(n)}function ve(s,e=t=>!!t,i=null){let t=0;const r=s.length,n=()=>{if(t>=r)return Promise.resolve(i);const o=s[t++];return Promise.resolve(o()).then(u=>e(u)?Promise.resolve(u):n())};return n()}function fe(s,e=t=>!!t,i=null){if(s.length===0)return Promise.resolve(i);let t=s.length;const r=()=>{t=-1;for(const n of s)n.cancel?.()};return new Promise((n,o)=>{for(const a of s)a.then(u=>{--t>=0&&e(u)?(r(),n(u)):t===0&&n(i)}).catch(u=>{--t>=0&&(r(),o(u))})})}class j{_size=0;_isDisposed=!1;runningPromises;maxDegreeOfParalellism;outstandingPromises;_onDrained;constructor(e){this.maxDegreeOfParalellism=e,this.outstandingPromises=[],this.runningPromises=0,this._onDrained=new T}whenIdle(){return this.size>0?h.toPromise(this.onDrained):Promise.resolve()}get onDrained(){return this._onDrained.event}get size(){return this._size}queue(e){if(this._isDisposed)throw new Error("Object has been disposed");return this._size++,new Promise((i,t)=>{this.outstandingPromises.push({factory:e,c:i,e:t}),this.consume()})}consume(){for(;this.outstandingPromises.length&&this.runningPromises<this.maxDegreeOfParalellism;){const e=this.outstandingPromises.shift();this.runningPromises++;const i=e.factory();i.then(e.c,e.e),i.then(()=>this.consumed(),()=>this.consumed())}}consumed(){this._isDisposed||(this.runningPromises--,--this._size===0&&this._onDrained.fire(),this.outstandingPromises.length>0&&this.consume())}clear(){if(this._isDisposed)throw new Error("Object has been disposed");this.outstandingPromises.length=0,this._size=this.runningPromises}dispose(){this._isDisposed=!0,this.outstandingPromises.length=0,this._size=0,this._onDrained.dispose()}}class z extends j{constructor(){super(1)}}class Pe{sequentializer=new M;tasks=0;queue(e){return this.sequentializer.isRunning()?this.sequentializer.queue(()=>this.sequentializer.run(this.tasks++,e())):this.sequentializer.run(this.tasks++,e())}}class be{queues=new Map;drainers=new Set;drainListeners=void 0;drainListenerCount=0;async whenDrained(){if(this.isDrained())return;const e=new y;return this.drainers.add(e),e.p}isDrained(){for(const[,e]of this.queues)if(e.size>0)return!1;return!0}queueSize(e,i=f){const t=i.getComparisonKey(e);return this.queues.get(t)?.size??0}queueFor(e,i,t=f){const r=t.getComparisonKey(e);let n=this.queues.get(r);if(!n){n=new z;const o=this.drainListenerCount++,a=h.once(n.onDrained)(()=>{n?.dispose(),this.queues.delete(r),this.onDidQueueDrain(),this.drainListeners?.deleteAndDispose(o),this.drainListeners?.size===0&&(this.drainListeners.dispose(),this.drainListeners=void 0)});this.drainListeners||(this.drainListeners=new _),this.drainListeners.set(o,a),this.queues.set(r,n)}return n.queue(i)}onDidQueueDrain(){this.isDrained()&&this.releaseDrainers()}releaseDrainers(){for(const e of this.drainers)e.complete();this.drainers.clear()}dispose(){for(const[,e]of this.queues)e.dispose();this.queues.clear(),this.releaseDrainers(),this.drainListeners?.dispose()}}class ye{_token;_isDisposed=!1;constructor(e,i){this._token=-1,typeof e=="function"&&typeof i=="number"&&this.setIfNotSet(e,i)}dispose(){this.cancel(),this._isDisposed=!0}cancel(){this._token!==-1&&(clearTimeout(this._token),this._token=-1)}cancelAndSet(e,i){if(this._isDisposed)throw new c("Calling 'cancelAndSet' on a disposed TimeoutTimer");this.cancel(),this._token=setTimeout(()=>{this._token=-1,e()},i)}setIfNotSet(e,i){if(this._isDisposed)throw new c("Calling 'setIfNotSet' on a disposed TimeoutTimer");this._token===-1&&(this._token=setTimeout(()=>{this._token=-1,e()},i))}}class ke{disposable=void 0;isDisposed=!1;cancel(){this.disposable?.dispose(),this.disposable=void 0}cancelAndSet(e,i,t=globalThis){if(this.isDisposed)throw new c("Calling 'cancelAndSet' on a disposed IntervalTimer");this.cancel();const r=t.setInterval(()=>{e()},i);this.disposable=v(()=>{t.clearInterval(r),this.disposable=void 0})}dispose(){this.cancel(),this.isDisposed=!0}}class b{runner;timeoutToken;timeout;timeoutHandler;constructor(e,i){this.timeoutToken=-1,this.runner=e,this.timeout=i,this.timeoutHandler=this.onTimeout.bind(this)}dispose(){this.cancel(),this.runner=null}cancel(){this.isScheduled()&&(clearTimeout(this.timeoutToken),this.timeoutToken=-1)}schedule(e=this.timeout){this.cancel(),this.timeoutToken=setTimeout(this.timeoutHandler,e)}get delay(){return this.timeout}set delay(e){this.timeout=e}isScheduled(){return this.timeoutToken!==-1}flush(){this.isScheduled()&&(this.cancel(),this.doRun())}onTimeout(){this.timeoutToken=-1,this.runner&&this.doRun()}doRun(){this.runner?.()}}class _e{runner;timeout;counter;intervalToken;intervalHandler;constructor(e,i){i%1e3,this.runner=e,this.timeout=i,this.counter=0,this.intervalToken=-1,this.intervalHandler=this.onInterval.bind(this)}dispose(){this.cancel(),this.runner=null}cancel(){this.isScheduled()&&(clearInterval(this.intervalToken),this.intervalToken=-1)}schedule(e=this.timeout){e%1e3,this.cancel(),this.counter=Math.ceil(e/1e3),this.intervalToken=setInterval(this.intervalHandler,1e3)}isScheduled(){return this.intervalToken!==-1}onInterval(){this.counter--,!(this.counter>0)&&(clearInterval(this.intervalToken),this.intervalToken=-1,this.runner?.())}}class Ie extends b{units=[];constructor(e,i){super(e,i)}work(e){this.units.push(e),this.isScheduled()||this.schedule()}doRun(){const e=this.units;this.units=[],this.runner?.(e)}dispose(){this.units=[],super.dispose()}}class ge extends k{constructor(i,t){super();this.options=i;this.handler=t}pendingWork=[];throttler=this._register(new I);disposed=!1;get pending(){return this.pendingWork.length}work(i){if(this.disposed)return!1;if(typeof this.options.maxBufferedWork=="number"){if(this.throttler.value){if(this.pending+i.length>this.options.maxBufferedWork)return!1}else if(this.pending+i.length-this.options.maxWorkChunkSize>this.options.maxBufferedWork)return!1}for(const t of i)this.pendingWork.push(t);return this.throttler.value||this.doWork(),!0}doWork(){this.handler(this.pendingWork.splice(0,this.options.maxWorkChunkSize)),this.pendingWork.length>0&&(this.throttler.value=new b(()=>{this.throttler.clear(),this.doWork()},this.options.throttleDelay),this.throttler.value.schedule())}dispose(){super.dispose(),this.disposed=!0}}let L,m;(function(){typeof globalThis.requestIdleCallback!="function"||typeof globalThis.cancelIdleCallback!="function"?m=(s,e)=>{g(()=>{if(i)return;const t=Date.now()+15;e(Object.freeze({didTimeout:!0,timeRemaining(){return Math.max(0,t-Date.now())}}))});let i=!1;return{dispose(){i||(i=!0)}}}:m=(s,e,i)=>{const t=s.requestIdleCallback(e,typeof i=="number"?{timeout:i}:void 0);let r=!1;return{dispose(){r||(r=!0,s.cancelIdleCallback(t))}}},L=s=>m(globalThis,s)})();class W{_executor;_handle;_didRun=!1;_value;_error;constructor(e,i){this._executor=()=>{try{this._value=i()}catch(t){this._error=t}finally{this._didRun=!0}},this._handle=m(e,()=>this._executor())}dispose(){this._handle.dispose()}get value(){if(this._didRun||(this._handle.dispose(),this._executor()),this._error)throw this._error;return this._value}get isInitialized(){return this._didRun}}class we extends W{constructor(e){super(globalThis,e)}}async function xe(s,e,i){let t;for(let r=0;r<i;r++)try{return await s()}catch(n){t=n,await P(e)}throw t}class M{_running;_queued;isRunning(e){return typeof e=="number"?this._running?.taskId===e:!!this._running}get running(){return this._running?.promise}cancelRunning(){this._running?.cancel()}run(e,i,t){return this._running={taskId:e,cancel:()=>t?.(),promise:i},i.then(()=>this.doneRunning(e),()=>this.doneRunning(e)),i}doneRunning(e){this._running&&e===this._running.taskId&&(this._running=void 0,this.runQueued())}runQueued(){if(this._queued){const e=this._queued;this._queued=void 0,e.run().then(e.promiseResolve,e.promiseReject)}}queue(e){if(this._queued)this._queued.run=e;else{const{promise:i,resolve:t,reject:r}=q();this._queued={run:e,promise:i,promiseResolve:t,promiseReject:r}}return this._queued.promise}hasQueued(){return!!this._queued}async join(){return this._queued?.promise??this._running?.promise}}class Re{constructor(e,i=()=>Date.now()){this.interval=e;this.nowFn=i}lastIncrementTime=0;value=0;increment(){const e=this.nowFn();return e-this.lastIncrementTime>this.interval&&(this.lastIncrementTime=e,this.value=0),this.value++,this.value}}var F=(i=>(i[i.Resolved=0]="Resolved",i[i.Rejected=1]="Rejected",i))(F||{});class y{completeCallback;errorCallback;outcome;get isRejected(){return this.outcome?.outcome===1}get isResolved(){return this.outcome?.outcome===0}get isSettled(){return!!this.outcome}get value(){return this.outcome?.outcome===0?this.outcome?.value:void 0}p;constructor(){this.p=new Promise((e,i)=>{this.completeCallback=e,this.errorCallback=i})}complete(e){return new Promise(i=>{this.completeCallback(e),this.outcome={outcome:0,value:e},i()})}error(e){return new Promise(i=>{this.errorCallback(e),this.outcome={outcome:1,value:e},i()})}cancel(){return this.error(new d)}}var Q;(i=>{async function s(t){let r;const n=await Promise.all(t.map(o=>o.then(a=>a,a=>{r||(r=a)})));if(typeof r<"u")throw r;return n}i.settled=s;function e(t){return new Promise(async(r,n)=>{try{await t(r,n)}catch(o){n(o)}})}i.withAsyncBody=e})(Q||={});class V{_value=void 0;get value(){return this._value}_error=void 0;get error(){return this._error}_isResolved=!1;get isResolved(){return this._isResolved}promise;constructor(e){this.promise=e.then(i=>(this._value=i,this._isResolved=!0,i),i=>{throw this._error=i,this._isResolved=!0,i})}requireValue(){if(!this._isResolved)throw new c("Promise is not resolved yet");if(this._error)throw this._error;return this._value}}class De{constructor(e){this._compute=e}_promise=new x(()=>new V(this._compute()));requireValue(){return this._promise.value.requireValue()}getPromise(){return this._promise.value.promise}get currentValue(){return this._promise.rawValue?.value}}var B=(t=>(t[t.Initial=0]="Initial",t[t.DoneOK=1]="DoneOK",t[t.DoneError=2]="DoneError",t))(B||{});class l{static fromArray(e){return new l(i=>{i.emitMany(e)})}static fromPromise(e){return new l(async i=>{i.emitMany(await e)})}static fromPromises(e){return new l(async i=>{await Promise.all(e.map(async t=>i.emitOne(await t)))})}static merge(e){return new l(async i=>{await Promise.all(e.map(async t=>{for await(const r of t)i.emitOne(r)}))})}static EMPTY=l.fromArray([]);_state;_results;_error;_onReturn;_onStateChanged;constructor(e,i){this._state=0,this._results=[],this._error=null,this._onReturn=i,this._onStateChanged=new T,queueMicrotask(async()=>{const t={emitOne:r=>this.emitOne(r),emitMany:r=>this.emitMany(r),reject:r=>this.reject(r)};try{await Promise.resolve(e(t)),this.resolve()}catch(r){this.reject(r)}finally{t.emitOne=void 0,t.emitMany=void 0,t.reject=void 0}})}[Symbol.asyncIterator](){let e=0;return{next:async()=>{do{if(this._state===2)throw this._error;if(e<this._results.length)return{done:!1,value:this._results[e++]};if(this._state===1)return{done:!0,value:void 0};await h.toPromise(this._onStateChanged.event)}while(!0)},return:async()=>(this._onReturn?.(),{done:!0,value:void 0})}}static map(e,i){return new l(async t=>{for await(const r of e)t.emitOne(i(r))})}map(e){return l.map(this,e)}static filter(e,i){return new l(async t=>{for await(const r of e)i(r)&&t.emitOne(r)})}filter(e){return l.filter(this,e)}static coalesce(e){return l.filter(e,i=>!!i)}coalesce(){return l.coalesce(this)}static async toPromise(e){const i=[];for await(const t of e)i.push(t);return i}toPromise(){return l.toPromise(this)}emitOne(e){this._state===0&&(this._results.push(e),this._onStateChanged.fire())}emitMany(e){this._state===0&&(this._results=this._results.concat(e),this._onStateChanged.fire())}resolve(){this._state===0&&(this._state=1,this._onStateChanged.fire())}reject(e){this._state===0&&(this._state=2,this._error=e,this._onStateChanged.fire())}}class K extends l{constructor(i,t){super(t);this._source=i}cancel(){this._source.cancel()}}function qe(s){const e=new p,i=s(e.token);return new K(e,async t=>{const r=e.token.onCancellationRequested(()=>{r.dispose(),e.dispose(),t.reject(new d)});try{for await(const n of i){if(e.token.isCancellationRequested)return;t.emitOne(n)}r.dispose(),e.dispose()}catch(n){r.dispose(),e.dispose(),t.reject(n)}})}class Ce{_deferred=new y;_asyncIterable;_errorFn;_emitFn;constructor(e){this._asyncIterable=new l(r=>{if(i){r.reject(i);return}return t&&r.emitMany(t),this._errorFn=n=>r.reject(n),this._emitFn=n=>r.emitOne(n),this._deferred.p},e);let i,t;this._emitFn=r=>{t||(t=[]),t.push(r)},this._errorFn=r=>{i||(i=r)}}get asyncIterable(){return this._asyncIterable}resolve(){this._deferred.complete()}reject(e){this._errorFn(e),this._deferred.complete()}emitOne(e){this._emitFn(e)}}export{W as AbstractIdleValue,l as AsyncIterableObject,Ce as AsyncIterableSource,he as AutoOpenBarrier,A as Barrier,K as CancelableAsyncIterableObject,y as DeferredPromise,O as Delayer,we as GlobalIdleValue,Re as IntervalCounter,ke as IntervalTimer,De as LazyStatefulPromise,Pe as LimitedQueue,j as Limiter,_e as ProcessTimeRunOnceScheduler,Q as Promises,z as Queue,be as ResourceQueue,b as RunOnceScheduler,Ie as RunOnceWorker,de as Sequencer,ce as SequencerByKey,V as StatefulPromise,M as TaskSequentializer,me as ThrottledDelayer,ge as ThrottledWorker,C as Throttler,ye as TimeoutTimer,m as _runWhenIdle,ue as asPromise,qe as createCancelableAsyncIterable,D as createCancelablePromise,pe as disposableTimeout,ve as first,fe as firstParallel,R as isThenable,q as promiseWithResolvers,ae as raceCancellablePromises,ne as raceCancellation,oe as raceCancellationError,le as raceTimeout,xe as retry,L as runWhenGlobalIdle,Te as sequence,P as timeout};
