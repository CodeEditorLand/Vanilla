var h=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var o=(l,t,e,r)=>{for(var i=r>1?void 0:r?_(t,e):t,s=l.length-1,a;s>=0;s--)(a=l[s])&&(i=(r?a(t,e,i):a(i))||i);return r&&i&&h(t,e,i),i};import{getWindow as m,runWhenWindowIdle as n}from"../../../../base/browser/dom.js";import{debounce as u}from"../../../../base/common/decorators.js";import{Disposable as c,MutableDisposable as b}from"../../../../base/common/lifecycle.js";var z=(t=>(t[t.StartDebouncingThreshold=200]="StartDebouncingThreshold",t))(z||{});class d extends c{constructor(e,r,i,s,a){super();this._isVisible=e;this._getXterm=r;this._resizeBothCallback=i;this._resizeXCallback=s;this._resizeYCallback=a}_latestX=0;_latestY=0;_resizeXJob=this._register(new b);_resizeYJob=this._register(new b);async resize(e,r,i){if(this._latestX=e,this._latestY=r,i||this._getXterm().raw.buffer.normal.length<200){this._resizeXJob.clear(),this._resizeYJob.clear(),this._resizeBothCallback(e,r);return}const s=m(this._getXterm().raw.element);if(s&&!this._isVisible()){this._resizeXJob.value||(this._resizeXJob.value=n(s,async()=>{this._resizeXCallback(this._latestX),this._resizeXJob.clear()})),this._resizeYJob.value||(this._resizeYJob.value=n(s,async()=>{this._resizeYCallback(this._latestY),this._resizeYJob.clear()}));return}this._resizeYCallback(r),this._latestX=e,this._debounceResizeX(e)}flush(){(this._resizeXJob.value||this._resizeYJob.value)&&(this._resizeXJob.clear(),this._resizeYJob.clear(),this._resizeBothCallback(this._latestX,this._latestY))}_debounceResizeX(e){this._resizeXCallback(e)}}o([u(100)],d.prototype,"_debounceResizeX",1);export{d as TerminalResizeDebouncer};
