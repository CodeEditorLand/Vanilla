var T=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var v=(c,i,e,n)=>{for(var r=n>1?void 0:n?M(i,e):i,t=c.length-1,o;t>=0;t--)(o=c[t])&&(r=(n?o(i,e,r):o(r))||r);return n&&r&&T(i,e,r),r},h=(c,i)=>(e,n)=>i(e,n,c);import{binarySearch as C,coalesceInPlace as w,equals as S}from"../../../../../vs/base/common/arrays.js";import{CancellationTokenSource as E}from"../../../../../vs/base/common/cancellation.js";import{onUnexpectedExternalError as R}from"../../../../../vs/base/common/errors.js";import{Iterable as _}from"../../../../../vs/base/common/iterator.js";import{DisposableStore as L}from"../../../../../vs/base/common/lifecycle.js";import{LRUCache as $}from"../../../../../vs/base/common/map.js";import{commonPrefixLength as F}from"../../../../../vs/base/common/strings.js";import"../../../../../vs/base/common/uri.js";import{Position as O}from"../../../../../vs/editor/common/core/position.js";import{Range as a}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languageFeatureRegistry.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeatureDebounceService as x}from"../../../../../vs/editor/common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as U}from"../../../../../vs/editor/common/services/languageFeatures.js";import{IModelService as z}from"../../../../../vs/editor/common/services/model.js";import{InstantiationType as B,registerSingleton as G}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as N}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/platform/markers/common/markers.js";class l{remove(){this.parent?.children.delete(this.id)}static findId(i,e){let n;typeof i=="string"?n=`${e.id}/${i}`:(n=`${e.id}/${i.name}`,e.children.get(n)!==void 0&&(n=`${e.id}/${i.name}_${i.range.startLineNumber}_${i.range.startColumn}`));let r=n;for(let t=0;e.children.get(r)!==void 0;t++)r=`${n}_${t}`;return r}static getElementById(i,e){if(!i)return;const n=F(i,e.id);if(n===i.length)return e;if(!(n<e.id.length))for(const[,r]of e.children){const t=l.getElementById(i,r);if(t)return t}}static size(i){let e=1;for(const[,n]of i.children)e+=l.size(n);return e}static empty(i){return i.children.size===0}}class D extends l{constructor(e,n,r){super();this.id=e;this.parent=n;this.symbol=r}children=new Map;marker}class P extends l{constructor(e,n,r,t){super();this.id=e;this.parent=n;this.label=r;this.order=t}children=new Map;getItemEnclosingPosition(e){return e?this._getItemEnclosingPosition(e,this.children):void 0}_getItemEnclosingPosition(e,n){for(const[,r]of n)if(!(!r.symbol.range||!a.containsPosition(r.symbol.range,e)))return this._getItemEnclosingPosition(e,r.children)||r}updateMarker(e){for(const[,n]of this.children)this._updateMarker(e,n)}_updateMarker(e,n){n.marker=void 0;const r=C(e,n.symbol.range,a.compareRangesUsingStarts);let t;r<0?(t=~r,t>0&&a.areIntersecting(e[t-1],n.symbol.range)&&(t-=1)):t=r;const o=[];let s;for(;t<e.length&&a.areIntersecting(n.symbol.range,e[t]);t++){const d=e[t];o.push(d),e[t]=void 0,(!s||d.severity>s)&&(s=d.severity)}for(const[,d]of n.children)this._updateMarker(o,d);s&&(n.marker={count:o.length,topSev:s}),w(e)}}class u extends l{constructor(e){super();this.uri=e;this.id="root",this.parent=void 0}static create(e,n,r){const t=new E(r),o=new u(n.uri),s=e.ordered(n),d=s.map((g,b)=>{const I=l.findId(`provider_${b}`,o),y=new P(I,o,g.displayName??"Unknown Outline Provider",b);return Promise.resolve(g.provideDocumentSymbols(n,t.token)).then(m=>{for(const k of m||[])u._makeOutlineElement(k,y);return y},m=>(R(m),y)).then(m=>{l.empty(m)?m.remove():o._groups.set(I,m)})}),p=e.onDidChange(()=>{const g=e.ordered(n);S(g,s)||t.cancel()});return Promise.all(d).then(()=>t.token.isCancellationRequested&&!r.isCancellationRequested?u.create(e,n,r):o._compact()).finally(()=>{t.dispose(),p.dispose(),t.dispose()})}static _makeOutlineElement(e,n){const r=l.findId(e,n),t=new D(r,n,e);if(e.children)for(const o of e.children)u._makeOutlineElement(o,t);n.children.set(t.id,t)}static get(e){for(;e;){if(e instanceof u)return e;e=e.parent}}id="root";parent=void 0;_groups=new Map;children=new Map;_compact(){let e=0;for(const[n,r]of this._groups)r.children.size===0?this._groups.delete(n):e+=1;if(e!==1)this.children=this._groups;else{const n=_.first(this._groups.values());for(const[,r]of n.children)r.parent=this,this.children.set(r.id,r)}return this}merge(e){return this.uri.toString()!==e.uri.toString()||this._groups.size!==e._groups.size?!1:(this._groups=e._groups,this.children=e.children,!0)}getItemEnclosingPosition(e,n){let r;if(n){let o=n.parent;for(;o&&!r;)o instanceof P&&(r=o),o=o.parent}let t;for(const[,o]of this._groups)if(t=o.getItemEnclosingPosition(e),t&&(!r||r===o))break;return t}getItemById(e){return l.getElementById(e,this)}updateMarker(e){e.sort(a.compareRangesUsingStarts);for(const[,n]of this._groups)n.updateMarker(e.slice(0))}getTopLevelSymbols(){const e=[];for(const n of this.children.values())n instanceof D?e.push(n.symbol):e.push(..._.map(n.children.values(),r=>r.symbol));return e.sort((n,r)=>a.compareRangesUsingStarts(n.range,r.range))}asListOfDocumentSymbols(){const e=this.getTopLevelSymbols(),n=[];return u._flattenDocumentSymbols(n,e,""),n.sort((r,t)=>O.compare(a.getStartPosition(r.range),a.getStartPosition(t.range))||O.compare(a.getEndPosition(t.range),a.getEndPosition(r.range)))}static _flattenDocumentSymbols(e,n,r){for(const t of n)e.push({kind:t.kind,tags:t.tags,name:t.name,detail:t.detail,containerName:t.containerName||r,range:t.range,selectionRange:t.selectionRange,children:void 0}),t.children&&u._flattenDocumentSymbols(e,t.children,t.name)}}const q=N("IOutlineModelService");let f=class{constructor(i,e,n){this._languageFeaturesService=i;this._debounceInformation=e.for(i.documentSymbolProvider,"DocumentSymbols",{min:350}),this._disposables.add(n.onModelRemoved(r=>{this._cache.delete(r.id)}))}_disposables=new L;_debounceInformation;_cache=new $(10,.7);dispose(){this._disposables.dispose()}async getOrCreate(i,e){const n=this._languageFeaturesService.documentSymbolProvider,r=n.ordered(i);let t=this._cache.get(i.id);if(!t||t.versionId!==i.getVersionId()||!S(t.provider,r)){const s=new E;t={versionId:i.getVersionId(),provider:r,promiseCnt:0,source:s,promise:u.create(n,i,s.token),model:void 0},this._cache.set(i.id,t);const d=Date.now();t.promise.then(p=>{t.model=p,this._debounceInformation.update(i,Date.now()-d)}).catch(p=>{this._cache.delete(i.id)})}if(t.model)return t.model;t.promiseCnt+=1;const o=e.onCancellationRequested(()=>{--t.promiseCnt===0&&(t.source.cancel(),this._cache.delete(i.id))});try{return await t.promise}finally{o.dispose()}}getDebounceValue(i){return this._debounceInformation.get(i)}};f=v([h(0,U),h(1,x),h(2,z)],f),G(q,f,B.Delayed);export{q as IOutlineModelService,D as OutlineElement,P as OutlineGroup,u as OutlineModel,f as OutlineModelService,l as TreeElement};