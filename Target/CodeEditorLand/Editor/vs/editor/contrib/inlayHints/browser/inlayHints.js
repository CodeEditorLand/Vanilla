import{CancellationError as v,onUnexpectedExternalError as m}from"../../../../base/common/errors.js";import{DisposableStore as u}from"../../../../base/common/lifecycle.js";import{Position as g}from"../../../common/core/position.js";import{Range as c}from"../../../common/core/range.js";import{Schemas as I}from"../../../../base/common/network.js";import{URI as R}from"../../../../base/common/uri.js";class H{constructor(e,t){this.range=e;this.direction=t}}class y{constructor(e,t,s){this.hint=e;this.anchor=t;this.provider=s}_isResolved=!1;_currentResolve;with(e){const t=new y(this.hint,e.anchor,this.provider);return t._isResolved=this._isResolved,t._currentResolve=this._currentResolve,t}async resolve(e){if(typeof this.provider.resolveInlayHint=="function"){if(this._currentResolve)return await this._currentResolve,e.isCancellationRequested?void 0:this.resolve(e);this._isResolved||(this._currentResolve=this._doResolve(e).finally(()=>this._currentResolve=void 0)),await this._currentResolve}}async _doResolve(e){try{const t=await Promise.resolve(this.provider.resolveInlayHint(this.hint,e));this.hint.tooltip=t?.tooltip??this.hint.tooltip,this.hint.label=t?.label??this.hint.label,this.hint.textEdits=t?.textEdits??this.hint.textEdits,this._isResolved=!0}catch(t){m(t),this._isResolved=!1}}}class f{static _emptyInlayHintList=Object.freeze({dispose(){},hints:[]});static async create(e,t,s,l){const i=[],a=e.ordered(t).reverse().map(n=>s.map(async r=>{try{const o=await n.provideInlayHints(t,r,l);(o?.hints.length||n.onDidChangeInlayHints)&&i.push([o??f._emptyInlayHintList,n])}catch(o){m(o)}}));if(await Promise.all(a.flat()),l.isCancellationRequested||t.isDisposed())throw new v;return new f(s,i,t)}_disposables=new u;items;ranges;provider;constructor(e,t,s){this.ranges=e,this.provider=new Set;const l=[];for(const[i,a]of t){this._disposables.add(i),this.provider.add(a);for(const n of i.hints){const r=s.validatePosition(n.position);let o="before";const h=f._getRangeAtPosition(s,r);let p;h.getStartPosition().isBefore(r)?(p=c.fromPositions(h.getStartPosition(),r),o="after"):(p=c.fromPositions(r,h.getEndPosition()),o="before"),l.push(new y(n,new H(p,o),a))}}this.items=l.sort((i,a)=>g.compare(i.hint.position,a.hint.position))}dispose(){this._disposables.dispose()}static _getRangeAtPosition(e,t){const s=t.lineNumber,l=e.getWordAtPosition(t);if(l)return new c(s,l.startColumn,s,l.endColumn);e.tokenization.tokenizeIfCheap(s);const i=e.tokenization.getLineTokens(s),a=t.column-1,n=i.findTokenIndexAtOffset(a);let r=i.getStartOffset(n),o=i.getEndOffset(n);return o-r===1&&(r===a&&n>1?(r=i.getStartOffset(n-1),o=i.getEndOffset(n-1)):o===a&&n<i.getCount()-1&&(r=i.getStartOffset(n+1),o=i.getEndOffset(n+1))),new c(s,r+1,s,o+1)}}function N(d){return R.from({scheme:I.command,path:d.id,query:d.arguments&&encodeURIComponent(JSON.stringify(d.arguments))}).toString()}export{H as InlayHintAnchor,y as InlayHintItem,f as InlayHintsFragments,N as asCommandLink};
