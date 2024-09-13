import"./cancellation.js";import{diffSets as J}from"./collections.js";import{onUnexpectedError as L}from"./errors.js";import{createSingleCallFunction as X}from"./functional.js";import{combinedDisposable as Z,Disposable as C,DisposableMap as U,DisposableStore as S,toDisposable as z}from"./lifecycle.js";import{LinkedList as N}from"./linkedList.js";import"./observable.js";import{StopWatch as ee}from"./stopwatch.js";import"./symbols.js";const te=!1,q=!1,ne=!1;var W;(_=>{_.None=()=>C.None;function e(s){if(ne){const{onDidAddListener:t}=s,r=k.create();let n=0;s.onDidAddListener=()=>{++n===2&&r.print(),t?.()}}}function i(s,t){return V(s,()=>{},0,void 0,!0,void 0,t)}_.defer=i;function a(s){return(t,r=null,n)=>{let o=!1,l;return l=s(h=>{if(!o)return l?l.dispose():o=!0,t.call(r,h)},null,n),o&&l.dispose(),l}}_.once=a;function u(s,t){return _.once(_.filter(s,t))}_.onceIf=u;function c(s,t,r){return I((n,o=null,l)=>s(h=>n.call(o,t(h)),null,l),r)}_.map=c;function p(s,t,r){return I((n,o=null,l)=>s(h=>{t(h),n.call(o,h)},null,l),r)}_.forEach=p;function f(s,t,r){return I((n,o=null,l)=>s(h=>t(h)&&n.call(o,h),null,l),r)}_.filter=f;function d(s){return s}_.signal=d;function m(...s){return(t,r=null,n)=>{const o=Z(...s.map(l=>l(h=>t.call(r,h))));return j(o,n)}}_.any=m;function A(s,t,r,n){let o=r;return c(s,l=>(o=t(o,l),o),n)}_.reduce=A;function I(s,t){let r;const n={onWillAddFirstListener(){r=s(o.fire,o)},onDidRemoveLastListener(){r?.dispose()}};t||e(n);const o=new b(n);return t?.add(o),o.event}function j(s,t){return t instanceof Array?t.push(s):t&&t.add(s),s}function V(s,t,r=100,n=!1,o=!1,l,h){let T,E,y,O=0,g;const P={leakWarningThreshold:l,onWillAddFirstListener(){T=s(B=>{O++,E=t(E,B),n&&!y&&(x.fire(E),E=void 0),g=()=>{const Y=E;E=void 0,y=void 0,(!n||O>1)&&x.fire(Y),O=0},typeof r=="number"?(clearTimeout(y),y=setTimeout(g,r)):y===void 0&&(y=0,queueMicrotask(g))})},onWillRemoveListener(){o&&O>0&&g?.()},onDidRemoveLastListener(){g=void 0,T.dispose()}};h||e(P);const x=new b(P);return h?.add(x),x.event}_.debounce=V;function de(s,t=0,r){return _.debounce(s,(n,o)=>n?(n.push(o),n):[o],t,void 0,!0,void 0,r)}_.accumulate=de;function he(s,t=(n,o)=>n===o,r){let n=!0,o;return f(s,l=>{const h=n||!t(l,o);return n=!1,o=l,h},r)}_.latch=he;function ve(s,t,r){return[_.filter(s,t,r),_.filter(s,n=>!t(n),r)]}_.split=ve;function ce(s,t=!1,r=[],n){let o=r.slice(),l=s(E=>{o?o.push(E):T.fire(E)});n&&n.add(l);const h=()=>{o?.forEach(E=>T.fire(E)),o=null},T=new b({onWillAddFirstListener(){l||(l=s(E=>T.fire(E)),n&&n.add(l))},onDidAddFirstListener(){o&&(t?setTimeout(h):h())},onDidRemoveLastListener(){l&&l.dispose(),l=null}});return n&&n.add(T),T.event}_.buffer=ce;function pe(s,t){return(n,o,l)=>{const h=t(new G);return s(function(T){const E=h.evaluate(T);E!==w&&n.call(o,E)},void 0,l)}}_.chain=pe;const w=Symbol("HaltChainable");class G{steps=[];map(t){return this.steps.push(t),this}forEach(t){return this.steps.push(r=>(t(r),r)),this}filter(t){return this.steps.push(r=>t(r)?r:w),this}reduce(t,r){let n=r;return this.steps.push(o=>(n=t(n,o),n)),this}latch(t=(r,n)=>r===n){let r=!0,n;return this.steps.push(o=>{const l=r||!t(o,n);return r=!1,n=o,l?o:w}),this}evaluate(t){for(const r of this.steps)if(t=r(t),t===w)break;return t}}function fe(s,t,r=n=>n){const n=(...T)=>h.fire(r(...T)),o=()=>s.on(t,n),l=()=>s.removeListener(t,n),h=new b({onWillAddFirstListener:o,onDidRemoveLastListener:l});return h.event}_.fromNodeEventEmitter=fe;function Te(s,t,r=n=>n){const n=(...T)=>h.fire(r(...T)),o=()=>s.addEventListener(t,n),l=()=>s.removeEventListener(t,n),h=new b({onWillAddFirstListener:o,onDidRemoveLastListener:l});return h.event}_.fromDOMEventEmitter=Te;function me(s){return new Promise(t=>a(s)(t))}_.toPromise=me;function Ee(s){const t=new b;return s.then(r=>{t.fire(r)},()=>{t.fire(void 0)}).finally(()=>{t.dispose()}),t.event}_.fromPromise=Ee;function be(s,t){return s(r=>t.fire(r))}_.forward=be;function _e(s,t,r){return t(r),s(n=>t(n))}_.runAndSubscribe=_e;class K{constructor(t,r){this._observable=t;const n={onWillAddFirstListener:()=>{t.addObserver(this),this._observable.reportChanges()},onDidRemoveLastListener:()=>{t.removeObserver(this)}};r||e(n),this.emitter=new b(n),r&&r.add(this.emitter)}emitter;_counter=0;_hasChanged=!1;beginUpdate(t){this._counter++}handlePossibleChange(t){}handleChange(t,r){this._hasChanged=!0}endUpdate(t){this._counter--,this._counter===0&&(this._observable.reportChanges(),this._hasChanged&&(this._hasChanged=!1,this.emitter.fire(this._observable.get())))}}function ye(s,t){return new K(s,t).emitter.event}_.fromObservable=ye;function ge(s){return(t,r,n)=>{let o=0,l=!1;const h={beginUpdate(){o++},endUpdate(){o--,o===0&&(s.reportChanges(),l&&(l=!1,t.call(r)))},handlePossibleChange(){},handleChange(){l=!0}};s.addObserver(h),s.reportChanges();const T={dispose(){s.removeObserver(h)}};return n instanceof S?n.add(T):Array.isArray(n)&&n.push(T),T}}_.fromObservableLight=ge})(W||={});class Q{static all=new Set;static _idPool=0;name;listenerCount=0;invocationCount=0;elapsedOverall=0;durations=[];_stopWatch;constructor(e){this.name=`${e}_${Q._idPool++}`,Q.all.add(this)}start(e){this._stopWatch=new ee,this.listenerCount=e}stop(){if(this._stopWatch){const e=this._stopWatch.elapsed();this.durations.push(e),this.elapsedOverall+=e,this.invocationCount+=1,this._stopWatch=void 0}}}let D=-1;function Ae(v){const e=D;return D=v,{dispose(){D=e}}}class M{constructor(e,i,a=(M._idPool++).toString(16).padStart(3,"0")){this._errorHandler=e;this.threshold=i;this.name=a}static _idPool=1;_stacks;_warnCountdown=0;dispose(){this._stacks?.clear()}check(e,i){const a=this.threshold;if(a<=0||i<a)return;this._stacks||(this._stacks=new Map);const u=this._stacks.get(e.value)||0;if(this._stacks.set(e.value,u+1),this._warnCountdown-=1,this._warnCountdown<=0){this._warnCountdown=a*.5;const[c,p]=this.getMostFrequentStack(),f=`[${this.name}] potential listener LEAK detected, having ${i} listeners already. MOST frequent listener (${p}):`,d=new ie(f,c);this._errorHandler(d)}return()=>{const c=this._stacks.get(e.value)||0;this._stacks.set(e.value,c-1)}}getMostFrequentStack(){if(!this._stacks)return;let e,i=0;for(const[a,u]of this._stacks)(!e||i<u)&&(e=[a,u],i=u);return e}}class k{constructor(e){this.value=e}static create(){const e=new Error;return new k(e.stack??"")}print(){}}class ie extends Error{constructor(e,i){super(e),this.name="ListenerLeakError",this.stack=i}}class se extends Error{constructor(e,i){super(e),this.name="ListenerRefusalError",this.stack=i}}let re=0;class R{constructor(e){this.value=e}stack;id=re++}const oe=2,$=(v,e)=>{if(v instanceof R)e(v);else for(let i=0;i<v.length;i++){const a=v[i];a&&e(a)}};let F;if(te){const v=[];setInterval(()=>{v.length!==0&&(v.length=0)},3e3),F=new FinalizationRegistry(e=>{typeof e=="string"&&v.push(e)})}class b{_options;_leakageMon;_perfMon;_disposed;_event;_listeners;_deliveryQueue;_size=0;constructor(e){this._options=e,this._leakageMon=D>0||this._options?.leakWarningThreshold?new M(e?.onListenerError??L,this._options?.leakWarningThreshold??D):void 0,this._perfMon=this._options?._profName?new Q(this._options._profName):void 0,this._deliveryQueue=this._options?.deliveryQueue}dispose(){if(!this._disposed){if(this._disposed=!0,this._deliveryQueue?.current===this&&this._deliveryQueue.reset(),this._listeners){if(q){const e=this._listeners;queueMicrotask(()=>{$(e,i=>i.stack?.print())})}this._listeners=void 0,this._size=0}this._options?.onDidRemoveLastListener?.(),this._leakageMon?.dispose()}}get event(){return this._event??=(e,i,a)=>{if(this._leakageMon&&this._size>this._leakageMon.threshold**2){const d=`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`,m=this._leakageMon.getMostFrequentStack()??["UNKNOWN stack",-1],A=new se(`${d}. HINT: Stack shows most frequent listener (${m[1]}-times)`,m[0]);return(this._options?.onListenerError||L)(A),C.None}if(this._disposed)return C.None;i&&(e=e.bind(i));const u=new R(e);let c,p;this._leakageMon&&this._size>=Math.ceil(this._leakageMon.threshold*.2)&&(u.stack=k.create(),c=this._leakageMon.check(u.stack,this._size+1)),q&&(u.stack=p??k.create()),this._listeners?this._listeners instanceof R?(this._deliveryQueue??=new H,this._listeners=[this._listeners,u]):this._listeners.push(u):(this._options?.onWillAddFirstListener?.(this),this._listeners=u,this._options?.onDidAddFirstListener?.(this)),this._size++;const f=z(()=>{F?.unregister(f),c?.(),this._removeListener(u)});if(a instanceof S?a.add(f):Array.isArray(a)&&a.push(f),F){const d=new Error().stack.split(`
`).slice(2,3).join(`
`).trim(),m=/(file:|vscode-file:\/\/vscode-app)?(\/[^:]*:\d+:\d+)/.exec(d);F.register(f,m?.[2]??d,f)}return f},this._event}_removeListener(e){if(this._options?.onWillRemoveListener?.(this),!this._listeners)return;if(this._size===1){this._listeners=void 0,this._options?.onDidRemoveLastListener?.(this),this._size=0;return}const i=this._listeners,a=i.indexOf(e);if(a===-1)throw new Error("Attempted to dispose unknown listener");this._size--,i[a]=void 0;const u=this._deliveryQueue.current===this;if(this._size*oe<=i.length){let c=0;for(let p=0;p<i.length;p++)i[p]?i[c++]=i[p]:u&&(this._deliveryQueue.end--,c<this._deliveryQueue.i&&this._deliveryQueue.i--);i.length=c}}_deliver(e,i){if(!e)return;const a=this._options?.onListenerError||L;if(!a){e.value(i);return}try{e.value(i)}catch(u){a(u)}}_deliverQueue(e){const i=e.current._listeners;for(;e.i<e.end;)this._deliver(i[e.i++],e.value);e.reset()}fire(e){if(this._deliveryQueue?.current&&(this._deliverQueue(this._deliveryQueue),this._perfMon?.stop()),this._perfMon?.start(this._size),this._listeners)if(this._listeners instanceof R)this._deliver(this._listeners,e);else{const i=this._deliveryQueue;i.enqueue(this,e,this._listeners.length),this._deliverQueue(i)}this._perfMon?.stop()}hasListeners(){return this._size>0}}const Pe=()=>new H;class H{i=-1;end=0;current;value;enqueue(e,i,a){this.i=0,this.end=a,this.current=e,this.value=i}reset(){this.i=this.end,this.current=void 0,this.value=void 0}}class Ue extends b{_asyncDeliveryQueue;async fireAsync(e,i,a){if(this._listeners)for(this._asyncDeliveryQueue||(this._asyncDeliveryQueue=new N),$(this._listeners,u=>this._asyncDeliveryQueue.push([u.value,e]));this._asyncDeliveryQueue.size>0&&!i.isCancellationRequested;){const[u,c]=this._asyncDeliveryQueue.shift(),p=[],f={...c,token:i,waitUntil:d=>{if(Object.isFrozen(p))throw new Error("waitUntil can NOT be called asynchronous");a&&(d=a(d,u)),p.push(d)}};try{u(f)}catch(d){L(d);continue}Object.freeze(p),await Promise.allSettled(p).then(d=>{for(const m of d)m.status==="rejected"&&L(m.reason)})}}}class ae extends b{_isPaused=0;_eventQueue=new N;_mergeFn;get isPaused(){return this._isPaused!==0}constructor(e){super(e),this._mergeFn=e?.merge}pause(){this._isPaused++}resume(){if(this._isPaused!==0&&--this._isPaused===0)if(this._mergeFn){if(this._eventQueue.size>0){const e=Array.from(this._eventQueue);this._eventQueue.clear(),super.fire(this._mergeFn(e))}}else for(;!this._isPaused&&this._eventQueue.size!==0;)super.fire(this._eventQueue.shift())}fire(e){this._size&&(this._isPaused!==0?this._eventQueue.push(e):super.fire(e))}}class ze extends ae{_delay;_handle;constructor(e){super(e),this._delay=e.delay??100}fire(e){this._handle||(this.pause(),this._handle=setTimeout(()=>{this._handle=void 0,this.resume()},this._delay)),super.fire(e)}}class Ne extends b{_queuedEvents=[];_mergeFn;constructor(e){super(e),this._mergeFn=e?.merge}fire(e){this.hasListeners()&&(this._queuedEvents.push(e),this._queuedEvents.length===1&&queueMicrotask(()=>{this._mergeFn?super.fire(this._mergeFn(this._queuedEvents)):this._queuedEvents.forEach(i=>super.fire(i)),this._queuedEvents=[]}))}}class le{emitter;hasListeners=!1;events=[];constructor(){this.emitter=new b({onWillAddFirstListener:()=>this.onFirstListenerAdd(),onDidRemoveLastListener:()=>this.onLastListenerRemove()})}get event(){return this.emitter.event}add(e){const i={event:e,listener:null};return this.events.push(i),this.hasListeners&&this.hook(i),z(X(()=>{this.hasListeners&&this.unhook(i);const u=this.events.indexOf(i);this.events.splice(u,1)}))}onFirstListenerAdd(){this.hasListeners=!0,this.events.forEach(e=>this.hook(e))}onLastListenerRemove(){this.hasListeners=!1,this.events.forEach(e=>this.unhook(e))}hook(e){e.listener=e.event(i=>this.emitter.fire(i))}unhook(e){e.listener?.dispose(),e.listener=null}dispose(){this.emitter.dispose();for(const e of this.events)e.listener?.dispose();this.events=[]}}class qe{_store=new S;event;constructor(e,i,a,u){const c=this._store.add(new le),p=this._store.add(new U);function f(d){p.set(d,c.add(u(d)))}for(const d of e)f(d);this._store.add(i(d=>{f(d)})),this._store.add(a(d=>{p.deleteAndDispose(d)})),this.event=c.event}dispose(){this._store.dispose()}}class $e{data=[];wrapEvent(e,i,a){return(u,c,p)=>e(f=>{const d=this.data[this.data.length-1];if(!i){d?d.buffers.push(()=>u.call(c,f)):u.call(c,f);return}const m=d;if(!m){u.call(c,i(a,f));return}m.items??=[],m.items.push(f),m.buffers.length===0&&d.buffers.push(()=>{m.reducedResult??=a?m.items.reduce(i,a):m.items.reduce(i),u.call(c,m.reducedResult)})},void 0,p)}bufferEvents(e){const i={buffers:new Array};this.data.push(i);const a=e();return this.data.pop(),i.buffers.forEach(u=>u()),a}}class He{listening=!1;inputEvent=W.None;inputEventListener=C.None;emitter=new b({onDidAddFirstListener:()=>{this.listening=!0,this.inputEventListener=this.inputEvent(this.emitter.fire,this.emitter)},onDidRemoveLastListener:()=>{this.listening=!1,this.inputEventListener.dispose()}});event=this.emitter.event;set input(e){this.inputEvent=e,this.listening&&(this.inputEventListener.dispose(),this.inputEventListener=e(this.emitter.fire,this.emitter))}dispose(){this.inputEventListener.dispose(),this.emitter.dispose()}}class je{constructor(e){this._value=e}static const(e){return new ue(e)}_onDidChange=new b;onDidChange=this._onDidChange.event;get value(){return this._value}set value(e){e!==this._value&&(this._value=e,this._onDidChange.fire(void 0))}}class ue{constructor(e){this.value=e}onDidChange=W.None}function Ve(v,e,i){const a=new U;let u=new Set(v());for(const p of u)a.set(p,i(p));const c=new S;return c.add(e(()=>{const p=v(),f=J(u,p);for(const d of f.removed)a.deleteAndDispose(d);for(const d of f.added)a.set(d,i(d));u=new Set(p)})),c.add(a),c}export{Ue as AsyncEmitter,ze as DebounceEmitter,qe as DynamicListEventMultiplexer,b as Emitter,W as Event,$e as EventBufferer,le as EventMultiplexer,Q as EventProfiling,ie as ListenerLeakError,se as ListenerRefusalError,Ne as MicrotaskEmitter,ae as PauseableEmitter,He as Relay,je as ValueWithChangeEvent,Pe as createEventDeliveryQueue,Ae as setGlobalLeakWarningThreshold,Ve as trackSetChanges};
