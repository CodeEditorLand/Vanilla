import{CancellationTokenSource as s}from"../../../vs/base/common/cancellation.js";import"../../../vs/base/common/lifecycle.js";class c{constructor(e){this.task=e}result=null;get(){if(this.result)return this.result;const e=new s,t=this.task(e.token);return this.result={promise:t,dispose:()=>{this.result=null,e.cancel(),e.dispose()}},this.result}}function o(n){return n}class T{lastCache=void 0;lastArgKey=void 0;_fn;_computeKey;constructor(e,t){typeof e=="function"?(this._fn=e,this._computeKey=o):(this._fn=t,this._computeKey=e.getCacheKey)}get(e){const t=this._computeKey(e);return this.lastArgKey!==t&&(this.lastArgKey=t,this.lastCache=this._fn(e)),this.lastCache}}class l{_map=new Map;_map2=new Map;get cachedValues(){return this._map}_fn;_computeKey;constructor(e,t){typeof e=="function"?(this._fn=e,this._computeKey=o):(this._fn=t,this._computeKey=e.getCacheKey)}get(e){const t=this._computeKey(e);if(this._map2.has(t))return this._map2.get(t);const r=this._fn(e);return this._map.set(e,r),this._map2.set(t,r),r}}export{c as Cache,l as CachedFunction,T as LRUCachedFunction,o as identity};
