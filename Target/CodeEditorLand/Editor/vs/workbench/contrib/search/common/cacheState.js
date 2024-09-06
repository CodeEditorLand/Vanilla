import{defaultGenerator as a}from"../../../../base/common/idGenerator.js";import{equals as s}from"../../../../base/common/objects.js";import"../../../services/search/common/search.js";var r=(e=>(e[e.Created=1]="Created",e[e.Loading=2]="Loading",e[e.Loaded=3]="Loaded",e[e.Errored=4]="Errored",e[e.Disposed=5]="Disposed",e))(r||{});class y{constructor(i,h,d,c){this.cacheQuery=i;this.loadFn=h;this.disposeFn=d;this.previousCacheState=c;if(this.previousCacheState){const e=Object.assign({},this.query,{cacheKey:null}),t=Object.assign({},this.previousCacheState.query,{cacheKey:null});s(e,t)||(this.previousCacheState.dispose(),this.previousCacheState=void 0)}}_cacheKey=a.nextId();get cacheKey(){return this.loadingPhase===3||!this.previousCacheState?this._cacheKey:this.previousCacheState.cacheKey}get isLoaded(){const i=this.loadingPhase===3;return i||!this.previousCacheState?i:this.previousCacheState.isLoaded}get isUpdating(){const i=this.loadingPhase===2;return i||!this.previousCacheState?i:this.previousCacheState.isUpdating}query=this.cacheQuery(this._cacheKey);loadingPhase=1;loadPromise;load(){return this.isUpdating?this:(this.loadingPhase=2,this.loadPromise=(async()=>{try{await this.loadFn(this.query),this.loadingPhase=3,this.previousCacheState&&(this.previousCacheState.dispose(),this.previousCacheState=void 0)}catch(i){throw this.loadingPhase=4,i}})(),this)}dispose(){this.loadPromise?(async()=>{try{await this.loadPromise}catch{}this.loadingPhase=5,this.disposeFn(this._cacheKey)})():this.loadingPhase=5,this.previousCacheState&&(this.previousCacheState.dispose(),this.previousCacheState=void 0)}}export{y as FileQueryCacheState};
