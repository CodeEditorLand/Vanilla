import{assertFn as p}from"../assert.js";import{strictEquals as s}from"../equals.js";import{onBugIndicatingError as l}from"../errors.js";import{DisposableStore as v}from"../lifecycle.js";import{_setDerivedOpts as b,BaseObservable as c}from"./base.js";import{DebugNameData as o}from"./debugName.js";import{getLogger as m}from"./logging.js";function M(n,r){return r!==void 0?new u(new o(n,void 0,r),r,void 0,void 0,void 0,s):new u(new o(void 0,void 0,n),n,void 0,void 0,void 0,s)}function W(n,r,e){return new T(new o(n,void 0,r),r,void 0,void 0,void 0,s,e)}function f(n,r){return new u(new o(n.owner,n.debugName,n.debugReferenceFn),r,void 0,void 0,n.onLastObserverRemoved,n.equalsFn??s)}b(f);function P(n,r){return new u(new o(n.owner,n.debugName,void 0),r,n.createEmptyChangeSummary,n.handleChange,void 0,n.equalityComparer??s)}function V(n,r){let e,t;r===void 0?(e=n,t=void 0):(t=n,e=r);const a=new v;return new u(new o(t,void 0,e),i=>(a.clear(),e(i,a)),void 0,void 0,()=>a.dispose(),s)}function j(n,r){let e,t;r===void 0?(e=n,t=void 0):(t=n,e=r);let a;return new u(new o(t,void 0,e),i=>{a?a.clear():a=new v;const d=e(i);return d&&a.add(d),d},void 0,void 0,()=>{a&&(a.dispose(),a=void 0)},s)}var g=(a=>(a[a.initial=0]="initial",a[a.dependenciesMightHaveChanged=1]="dependenciesMightHaveChanged",a[a.stale=2]="stale",a[a.upToDate=3]="upToDate",a))(g||{});class u extends c{constructor(e,t,a,i,d=void 0,h){super();this._debugNameData=e;this._computeFn=t;this.createChangeSummary=a;this._handleChange=i;this._handleLastObserverRemoved=d;this._equalityComparator=h;this.changeSummary=this.createChangeSummary?.(),m()?.handleDerivedCreated(this)}state=0;value=void 0;updateCount=0;dependencies=new Set;dependenciesToBeRemoved=new Set;changeSummary=void 0;get debugName(){return this._debugNameData.getDebugName(this)??"(anonymous)"}onLastObserverRemoved(){this.state=0,this.value=void 0;for(const e of this.dependencies)e.removeObserver(this);this.dependencies.clear(),this._handleLastObserverRemoved?.()}get(){if(this.observers.size===0){const e=this._computeFn(this,this.createChangeSummary?.());return this.onLastObserverRemoved(),e}else{do{if(this.state===1){for(const e of this.dependencies)if(e.reportChanges(),this.state===2)break}this.state===1&&(this.state=3),this._recomputeIfNeeded()}while(this.state!==3);return this.value}}_recomputeIfNeeded(){if(this.state===3)return;const e=this.dependenciesToBeRemoved;this.dependenciesToBeRemoved=this.dependencies,this.dependencies=e;const t=this.state!==0,a=this.value;this.state=3;let i=!1;try{const d=this.changeSummary;this.changeSummary=this.createChangeSummary?.();try{this.value=this._computeFn(this,d)}finally{for(const h of this.dependenciesToBeRemoved)h.removeObserver(this);this.dependenciesToBeRemoved.clear()}i=t&&!this._equalityComparator(a,this.value),m()?.handleDerivedRecomputed(this,{oldValue:a,newValue:this.value,change:void 0,didChange:i,hadValue:t})}catch(d){l(d)}if(i)for(const d of this.observers)d.handleChange(this,void 0)}toString(){return`LazyDerived<${this.debugName}>`}beginUpdate(e){this.updateCount++;const t=this.updateCount===1;if(this.state===3&&(this.state=1,!t))for(const a of this.observers)a.handlePossibleChange(this);if(t)for(const a of this.observers)a.beginUpdate(this)}endUpdate(e){if(this.updateCount--,this.updateCount===0){const t=[...this.observers];for(const a of t)a.endUpdate(this)}p(()=>this.updateCount>=0)}handlePossibleChange(e){if(this.state===3&&this.dependencies.has(e)&&!this.dependenciesToBeRemoved.has(e)){this.state=1;for(const t of this.observers)t.handlePossibleChange(this)}}handleChange(e,t){if(this.dependencies.has(e)&&!this.dependenciesToBeRemoved.has(e)){let a=!1;try{a=this._handleChange?this._handleChange({changedObservable:e,change:t,didChange:d=>d===e},this.changeSummary):!0}catch(d){l(d)}const i=this.state===3;if(a&&(this.state===1||i)&&(this.state=2,i))for(const d of this.observers)d.handlePossibleChange(this)}}readObservable(e){e.addObserver(this);const t=e.get();return this.dependencies.add(e),this.dependenciesToBeRemoved.delete(e),t}addObserver(e){const t=!this.observers.has(e)&&this.updateCount>0;super.addObserver(e),t&&e.beginUpdate(this)}removeObserver(e){const t=this.observers.has(e)&&this.updateCount>0;super.removeObserver(e),t&&e.endUpdate(this)}}class T extends u{constructor(e,t,a,i,d=void 0,h,C){super(e,t,a,i,d,h);this.set=C}}export{u as Derived,T as DerivedWithSetter,M as derived,j as derivedDisposable,P as derivedHandleChanges,f as derivedOpts,W as derivedWithSetter,V as derivedWithStore};
