import{findLast as w}from"../../../../base/common/arraysFind.js";import{CancellationTokenSource as x}from"../../../../base/common/cancellation.js";import{Disposable as T,DisposableStore as h,toDisposable as _}from"../../../../base/common/lifecycle.js";import{autorun as S,autorunHandleChanges as C,autorunOpts as R,autorunWithStore as L,observableValue as p,transaction as N}from"../../../../base/common/observable.js";import{ElementSizeObserver as E}from"../../config/elementSizeObserver.js";import{Position as v}from"../../../common/core/position.js";import{Range as m}from"../../../common/core/range.js";import{TextLength as O}from"../../../common/core/textLength.js";function se(o,t,e,n){if(o.length===0)return t;if(t.length===0)return o;const i=[];let r=0,a=0;for(;r<o.length&&a<t.length;){const u=o[r],b=t[a],c=e(u),f=e(b);c<f?(i.push(u),r++):c>f?(i.push(b),a++):(i.push(n(u,b)),r++,a++)}for(;r<o.length;)i.push(o[r]),r++;for(;a<t.length;)i.push(t[a]),a++;return i}function ae(o,t){const e=new h,n=o.createDecorationsCollection();return e.add(R({debugName:()=>`Apply decorations from ${t.debugName}`},i=>{const r=t.read(i);n.set(r)})),e.add({dispose:()=>{n.clear()}}),e}function le(o,t){return o.appendChild(t),_(()=>{t.remove()})}function de(o,t){return o.prepend(t),_(()=>{t.remove()})}class ue extends T{elementSizeObserver;_width;get width(){return this._width}_height;get height(){return this._height}_automaticLayout=!1;get automaticLayout(){return this._automaticLayout}constructor(t,e){super(),this.elementSizeObserver=this._register(new E(t,e)),this._width=p(this,this.elementSizeObserver.getWidth()),this._height=p(this,this.elementSizeObserver.getHeight()),this._register(this.elementSizeObserver.onDidChange(n=>N(i=>{this._width.set(this.elementSizeObserver.getWidth(),i),this._height.set(this.elementSizeObserver.getHeight(),i)})))}observe(t){this.elementSizeObserver.observe(t)}setAutomaticLayout(t){this._automaticLayout=t,t?this.elementSizeObserver.startObserving():this.elementSizeObserver.stopObserving()}}function be(o,t,e){let n=t.get(),i=n,r=n;const a=p("animatedValue",n);let u=-1;const b=300;let c;e.add(C({createEmptyChangeSummary:()=>({animate:!1}),handleChange:(l,s)=>(l.didChange(t)&&(s.animate=s.animate||l.change),!0)},(l,s)=>{c!==void 0&&(o.cancelAnimationFrame(c),c=void 0),i=r,n=t.read(l),u=Date.now()-(s.animate?0:b),f()}));function f(){const l=Date.now()-u;r=Math.floor(Z(l,i,n-i,b)),l<b?c=o.requestAnimationFrame(f):r=n,a.set(r,void 0)}return a}function Z(o,t,e,n){return o===n?t+e:e*(-Math.pow(2,-10*o/n)+1)+t}function P(o,t){const e={};for(const n in o)e[n]=o[n];for(const n in t){const i=t[n];typeof e[n]=="object"&&i&&typeof i=="object"?e[n]=P(e[n],i):e[n]=i}return e}class ce extends T{constructor(t,e,n){super(),this._register(new y(t,n)),this._register(V(n,{height:e.actualHeight,top:e.actualTop}))}}class fe{constructor(t,e){this._afterLineNumber=t;this.heightInPx=e}domNode=document.createElement("div");_actualTop=p(this,void 0);_actualHeight=p(this,void 0);actualTop=this._actualTop;actualHeight=this._actualHeight;showInHiddenAreas=!0;get afterLineNumber(){return this._afterLineNumber.get()}onChange=this._afterLineNumber;onDomNodeTop=t=>{this._actualTop.set(t,void 0)};onComputedHeight=t=>{this._actualHeight.set(t,void 0)}}class y{constructor(t,e){this._editor=t;this._domElement=e;this._editor.addOverlayWidget(this._overlayWidget)}static _counter=0;_overlayWidgetId=`managedOverlayWidget-${y._counter++}`;_overlayWidget={getId:()=>this._overlayWidgetId,getDomNode:()=>this._domElement,getPosition:()=>null};dispose(){this._editor.removeOverlayWidget(this._overlayWidget)}}function V(o,t){return S(e=>{for(let[n,i]of Object.entries(t))i&&typeof i=="object"&&"read"in i&&(i=i.read(e)),typeof i=="number"&&(i=`${i}px`),n=n.replace(/[A-Z]/g,r=>"-"+r.toLowerCase()),o.style[n]=i})}function pe(o,t,e,n){const i=new h,r=[];return i.add(L((a,u)=>{const b=t.read(a),c=new Map,f=new Map;e&&e(!0),o.changeViewZones(l=>{for(const s of r)l.removeZone(s),n?.delete(s);r.length=0;for(const s of b){const d=l.addZone(s);s.setZoneId&&s.setZoneId(d),r.push(d),n?.add(d),c.set(s,d)}}),e&&e(!1),u.add(C({createEmptyChangeSummary(){return{zoneIds:[]}},handleChange(l,s){const d=f.get(l.changedObservable);return d!==void 0&&s.zoneIds.push(d),!0}},(l,s)=>{for(const d of b)d.onChange&&(f.set(d.onChange,c.get(d)),d.onChange.read(l));e&&e(!0),o.changeViewZones(d=>{for(const I of s.zoneIds)d.layoutZone(I)}),e&&e(!1)}))})),i.add({dispose(){e&&e(!0),o.changeViewZones(a=>{for(const u of r)a.removeZone(u)}),n?.clear(),e&&e(!1)}}),i}class me extends x{dispose(){super.dispose(!0)}}function he(o,t){const e=w(t,i=>i.original.startLineNumber<=o.lineNumber);if(!e)return m.fromPositions(o);if(e.original.endLineNumberExclusive<=o.lineNumber){const i=o.lineNumber-e.original.endLineNumberExclusive+e.modified.endLineNumberExclusive;return m.fromPositions(new v(i,o.column))}if(!e.innerChanges)return m.fromPositions(new v(e.modified.startLineNumber,1));const n=w(e.innerChanges,i=>i.originalRange.getStartPosition().isBeforeOrEqual(o));if(!n){const i=o.lineNumber-e.original.startLineNumber+e.modified.startLineNumber;return m.fromPositions(new v(i,o.column))}if(n.originalRange.containsPosition(o))return n.modifiedRange;{const i=j(n.originalRange.getEndPosition(),o);return m.fromPositions(i.addToPosition(n.modifiedRange.getEndPosition()))}}function j(o,t){return o.lineNumber===t.lineNumber?new O(0,t.column-o.column):new O(t.lineNumber-o.lineNumber,t.column-1)}function ve(o,t){let e;return o.filter(n=>{const i=t(n,e);return e=n,i})}class D{static create(t,e=void 0){return new g(t,t,e)}static createWithDisposable(t,e,n=void 0){const i=new h;return i.add(e),i.add(t),new g(t,i,n)}static createOfNonDisposable(t,e,n=void 0){return new g(t,e,n)}}class g extends D{constructor(e,n,i){super();this.object=e;this._disposable=n;this._debugOwner=i;i&&this._addOwner(i)}_refCount=1;_isDisposed=!1;_owners=[];_addOwner(e){e&&this._owners.push(e)}createNewRef(e){return this._refCount++,e&&this._addOwner(e),new M(this,e)}dispose(){this._isDisposed||(this._isDisposed=!0,this._decreaseRefCount(this._debugOwner))}_decreaseRefCount(e){if(this._refCount--,this._refCount===0&&this._disposable.dispose(),e){const n=this._owners.indexOf(e);n!==-1&&this._owners.splice(n,1)}}}class M extends D{constructor(e,n){super();this._base=e;this._debugOwner=n}_isDisposed=!1;get object(){return this._base.object}createNewRef(e){return this._base.createNewRef(e)}dispose(){this._isDisposed||(this._isDisposed=!0,this._base._decreaseRefCount(this._debugOwner))}}export{me as DisposableCancellationTokenSource,y as ManagedOverlayWidget,ue as ObservableElementSizeObserver,fe as PlaceholderViewZone,D as RefCounted,ce as ViewZoneOverlayWidget,be as animatedObservable,le as appendRemoveOnDispose,ae as applyObservableDecorations,V as applyStyle,pe as applyViewZones,P as deepMerge,ve as filterWithPrevious,se as joinCombine,de as prependRemoveOnDispose,he as translatePosition};
