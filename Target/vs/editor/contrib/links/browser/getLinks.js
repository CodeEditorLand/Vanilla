import{coalesce as d}from"../../../../base/common/arrays.js";import{CancellationToken as p}from"../../../../base/common/cancellation.js";import{onUnexpectedExternalError as c}from"../../../../base/common/errors.js";import{DisposableStore as g,isDisposable as f}from"../../../../base/common/lifecycle.js";import{assertType as L}from"../../../../base/common/types.js";import{URI as h}from"../../../../base/common/uri.js";import{Range as k}from"../../../common/core/range.js";import"../../../common/model.js";import"../../../common/languages.js";import{IModelService as v}from"../../../common/services/model.js";import{CommandsRegistry as I}from"../../../../platform/commands/common/commands.js";import"../../../common/languageFeatureRegistry.js";import{ILanguageFeaturesService as _}from"../../../common/services/languageFeatures.js";class P{_link;_provider;constructor(n,e){this._link=n,this._provider=e}toJSON(){return{range:this.range,url:this.url,tooltip:this.tooltip}}get range(){return this._link.range}get url(){return this._link.url}get tooltip(){return this._link.tooltip}async resolve(n){return this._link.url?this._link.url:typeof this._provider.resolveLink=="function"?Promise.resolve(this._provider.resolveLink(this._link,n)).then(e=>(this._link=e||this._link,this._link.url?this.resolve(n):Promise.reject(new Error("missing")))):Promise.reject(new Error("missing"))}}class u{links;_disposables=new g;constructor(n){let e=[];for(const[i,t]of n){const o=i.links.map(r=>new P(r,t));e=u._union(e,o),f(i)&&this._disposables.add(i)}this.links=e}dispose(){this._disposables.dispose(),this.links.length=0}static _union(n,e){const i=[];let t,o,r,s;for(t=0,r=0,o=n.length,s=e.length;t<o&&r<s;){const l=n[t],m=e[r];if(k.areIntersectingOrTouching(l.range,m.range)){t++;continue}k.compareRangesUsingStarts(l.range,m.range)<0?(i.push(l),t++):(i.push(m),r++)}for(;t<o;t++)i.push(n[t]);for(;r<s;r++)i.push(e[r]);return i}}function R(a,n,e){const i=[],t=a.ordered(n).reverse().map((o,r)=>Promise.resolve(o.provideLinks(n,e)).then(s=>{s&&(i[r]=[s,o])},c));return Promise.all(t).then(()=>{const o=new u(d(i));return e.isCancellationRequested?(o.dispose(),new u([])):o})}I.registerCommand("_executeLinkProvider",async(a,...n)=>{let[e,i]=n;L(e instanceof h),typeof i!="number"&&(i=0);const{linkProvider:t}=a.get(_),o=a.get(v).getModel(e);if(!o)return[];const r=await R(t,o,p.None);if(!r)return[];for(let l=0;l<Math.min(i,r.links.length);l++)await r.links[l].resolve(p.None);const s=r.links.slice(0);return r.dispose(),s});export{P as Link,u as LinksList,R as getLinks};
