import{Orientation as b,Sash as u,SashState as h}from"../../../../../../vs/base/browser/ui/sash/sash.js";import{Disposable as _}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as d,observableValue as f}from"../../../../../../vs/base/common/observable.js";import{derivedWithSetter as m}from"../../../../../../vs/base/common/observableInternal/derived.js";import"../diffEditorOptions.js";class w{constructor(t,s){this._options=t;this.dimensions=s}sashLeft=m(this,t=>{const s=this._sashRatio.read(t)??this._options.splitViewDefaultRatio.read(t);return this._computeSashLeft(s,t)},(t,s)=>{const e=this.dimensions.width.get();this._sashRatio.set(t/e,s)});_sashRatio=f(this,void 0);resetSash(){this._sashRatio.set(void 0,void 0)}_computeSashLeft(t,s){const e=this.dimensions.width.read(s),o=Math.floor(this._options.splitViewDefaultRatio.read(s)*e),n=this._options.enableSplitViewResizing.read(s)?Math.floor(t*e):o,a=100;return e<=a*2?o:n<a?a:n>e-a?e-a:n}}class V extends _{constructor(s,e,o,n,a,p){super();this._domNode=s;this._dimensions=e;this._enabled=o;this._boundarySashes=n;this.sashLeft=a;this._resetSash=p;this._register(this._sash.onDidStart(()=>{this._startSashPosition=this.sashLeft.get()})),this._register(this._sash.onDidChange(i=>{this.sashLeft.set(this._startSashPosition+(i.currentX-i.startX),void 0)})),this._register(this._sash.onDidEnd(()=>this._sash.layout())),this._register(this._sash.onDidReset(()=>this._resetSash())),this._register(d(i=>{const r=this._boundarySashes.read(i);r&&(this._sash.orthogonalEndSash=r.bottom)})),this._register(d(i=>{const r=this._enabled.read(i);this._sash.state=r?h.Enabled:h.Disabled,this.sashLeft.read(i),this._dimensions.height.read(i),this._sash.layout()}))}_sash=this._register(new u(this._domNode,{getVerticalSashTop:s=>0,getVerticalSashLeft:s=>this.sashLeft.get(),getVerticalSashHeight:s=>this._dimensions.height.get()},{orientation:b.VERTICAL}));_startSashPosition=void 0}export{V as DiffEditorSash,w as SashLayout};