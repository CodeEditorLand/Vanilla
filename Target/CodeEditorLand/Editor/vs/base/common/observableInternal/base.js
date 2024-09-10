import{strictEquals as T}from"../equals.js";import{DebugNameData as o,getFunctionName as p}from"./debugName.js";import{getLogger as l}from"./logging.js";let g;function $(r){g=r}let h;function k(r){h=r}let v;function z(r){v=r}class f{get TChange(){return null}reportChanges(){this.get()}read(e){return e?e.readObservable(this):this.get()}map(e,a){const n=a===void 0?void 0:e,t=a===void 0?e:a;return v({owner:n,debugName:()=>{const s=p(t);if(s!==void 0)return s;const i=/^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/.exec(t.toString());if(i)return`${this.debugName}.${i[2]}`;if(!n)return`${this.debugName} (mapped)`},debugReferenceFn:t},s=>t(this.read(s),s))}flatten(){return v({owner:void 0,debugName:()=>`${this.debugName} (flattened)`},e=>this.read(e).read(e))}recomputeInitiallyAndOnChange(e,a){return e.add(g(this,a)),this}keepObserved(e){return e.add(h(this)),this}get debugValue(){return this.get()}}class I extends f{observers=new Set;addObserver(e){const a=this.observers.size;this.observers.add(e),a===0&&this.onFirstObserverAdded()}removeObserver(e){this.observers.delete(e)&&this.observers.size===0&&this.onLastObserverRemoved()}onFirstObserverAdded(){}onLastObserverRemoved(){}}function O(r,e){const a=new d(r,e);try{r(a)}finally{a.finish()}}let b;function j(r){if(b)r(b);else{const e=new d(r,void 0);b=e;try{r(e)}finally{e.finish(),b=void 0}}}async function q(r,e){const a=new d(r,e);try{await r(a)}finally{a.finish()}}function F(r,e,a){r?e(r):O(e,a)}class d{constructor(e,a){this._fn=e;this._getDebugName=a;l()?.handleBeginTransaction(this)}updatingObservers=[];getDebugName(){return this._getDebugName?this._getDebugName():p(this._fn)}updateObserver(e,a){this.updatingObservers.push({observer:e,observable:a}),e.beginUpdate(a)}finish(){const e=this.updatingObservers;for(let a=0;a<e.length;a++){const{observer:n,observable:t}=e[a];n.endUpdate(t)}this.updatingObservers=null,l()?.handleEndTransaction()}}function E(r,e){let a;return typeof r=="string"?a=new o(void 0,r,void 0):a=new o(r,void 0,void 0),new c(a,e,T)}class c extends I{constructor(a,n,t){super();this._debugNameData=a;this._equalityComparator=t;this._value=n}_value;get debugName(){return this._debugNameData.getDebugName(this)??"ObservableValue"}get(){return this._value}set(a,n,t){if(t===void 0&&this._equalityComparator(this._value,a))return;let s;n||(n=s=new d(()=>{},()=>`Setting ${this.debugName}`));try{const u=this._value;this._setValue(a),l()?.handleObservableChanged(this,{oldValue:u,newValue:a,change:t,didChange:!0,hadValue:!0});for(const i of this.observers)n.updateObserver(i,this),i.handleChange(this,t)}finally{s&&s.finish()}}toString(){return`${this.debugName}: ${this._value}`}_setValue(a){this._value=a}}function Z(r,e){let a;return typeof r=="string"?a=new o(void 0,r,void 0):a=new o(r,void 0,void 0),new m(a,e,T)}class m extends c{_setValue(e){this._value!==e&&(this._value&&this._value.dispose(),this._value=e)}dispose(){this._value?.dispose()}}export{I as BaseObservable,f as ConvenientObservable,m as DisposableObservableValue,c as ObservableValue,d as TransactionImpl,z as _setDerivedOpts,k as _setKeepObserved,$ as _setRecomputeInitiallyAndOnChange,q as asyncTransaction,Z as disposableObservableValue,j as globalTransaction,E as observableValue,F as subtransaction,O as transaction};
