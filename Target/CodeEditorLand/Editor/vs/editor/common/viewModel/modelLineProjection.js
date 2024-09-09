import{LineTokens as S}from"../tokens/lineTokens.js";import{Position as k}from"../core/position.js";import"../core/range.js";import{PositionAffinity as A}from"../model.js";import{LineInjectedText as N}from"../textModelEvents.js";import"../modelLineProjectionData.js";import{SingleLineInlineDecoration as E,ViewLineData as O}from"../viewModel.js";function X(p,e){return p===null?e?w.INSTANCE:h.INSTANCE:new y(p,e)}class y{_projectionData;_isVisible;constructor(e,n){this._projectionData=e,this._isVisible=n}isVisible(){return this._isVisible}setVisible(e){return this._isVisible=e,this}getProjectionData(){return this._projectionData}getViewLineCount(){return this._isVisible?this._projectionData.getOutputLineCount():0}getViewLineContent(e,n,t){this._assertVisible();const i=t>0?this._projectionData.breakOffsets[t-1]:0,r=this._projectionData.breakOffsets[t];let l;if(this._projectionData.injectionOffsets!==null){const m=this._projectionData.injectionOffsets.map((s,c)=>new N(0,0,s+1,this._projectionData.injectionOptions[c],0));l=N.applyInjectedText(e.getLineContent(n),m).substring(i,r)}else l=e.getValueInRange({startLineNumber:n,startColumn:i+1,endLineNumber:n,endColumn:r+1});return t>0&&(l=T(this._projectionData.wrappedTextIndentLength)+l),l}getViewLineLength(e,n,t){return this._assertVisible(),this._projectionData.getLineLength(t)}getViewLineMinColumn(e,n,t){return this._assertVisible(),this._projectionData.getMinOutputOffset(t)+1}getViewLineMaxColumn(e,n,t){return this._assertVisible(),this._projectionData.getMaxOutputOffset(t)+1}getViewLineData(e,n,t){const i=new Array;return this.getViewLinesData(e,n,t,1,0,[!0],i),i[0]}getViewLinesData(e,n,t,i,r,l,m){this._assertVisible();const a=this._projectionData,s=a.injectionOffsets,c=a.injectionOptions;let d=null;if(s){d=[];let u=0,o=0;for(let b=0;b<a.getOutputLineCount();b++){const g=new Array;d[b]=g;const L=b>0?a.breakOffsets[b-1]:0,I=a.breakOffsets[b];for(;o<s.length;){const P=c[o].content.length,V=s[o]+u,_=V+P;if(V>I)break;if(L<_){const j=c[o];if(j.inlineClassName){const D=b>0?a.wrappedTextIndentLength:0,C=D+Math.max(V-L,0),x=D+Math.min(_-L,I-L);C!==x&&g.push(new E(C,x,j.inlineClassName,j.inlineClassNameAffectsLetterSpacing))}}if(_<=I)u+=P,o++;else break}}}let f;if(s){const u=[];for(let o=0;o<s.length;o++){const b=s[o],g=c[o].tokens;g?g.forEach((L,I)=>{u.push({offset:b,text:L.substring(c[o].content),tokenMetadata:I.metadata})}):u.push({offset:b,text:c[o].content,tokenMetadata:S.defaultTokenMetadata})}f=e.tokenization.getLineTokens(n).withInserted(u)}else f=e.tokenization.getLineTokens(n);for(let u=t;u<t+i;u++){const o=r+u-t;if(!l[o]){m[o]=null;continue}m[o]=this._getViewLineData(f,d?d[u]:null,u)}}_getViewLineData(e,n,t){this._assertVisible();const i=this._projectionData,r=t>0?i.wrappedTextIndentLength:0,l=t>0?i.breakOffsets[t-1]:0,m=i.breakOffsets[t],a=e.sliceAndInflate(l,m,r);let s=a.getLineContent();t>0&&(s=T(i.wrappedTextIndentLength)+s);const c=this._projectionData.getMinOutputOffset(t)+1,d=s.length+1,f=t+1<this.getViewLineCount(),u=t===0?0:i.breakOffsetsVisibleColumn[t-1];return new O(s,f,c,d,u,a,n)}getModelColumnOfViewPosition(e,n){return this._assertVisible(),this._projectionData.translateToInputOffset(e,n-1)+1}getViewPositionOfModelPosition(e,n,t=A.None){return this._assertVisible(),this._projectionData.translateToOutputPosition(n-1,t).toPosition(e)}getViewLineNumberOfModelPosition(e,n){this._assertVisible();const t=this._projectionData.translateToOutputPosition(n-1);return e+t.outputLineIndex}normalizePosition(e,n,t){const i=n.lineNumber-e;return this._projectionData.normalizeOutputPosition(e,n.column-1,t).toPosition(i)}getInjectedTextAt(e,n){return this._projectionData.getInjectedText(e,n-1)}_assertVisible(){if(!this._isVisible)throw new Error("Not supported")}}class w{static INSTANCE=new w;constructor(){}isVisible(){return!0}setVisible(e){return e?this:h.INSTANCE}getProjectionData(){return null}getViewLineCount(){return 1}getViewLineContent(e,n,t){return e.getLineContent(n)}getViewLineLength(e,n,t){return e.getLineLength(n)}getViewLineMinColumn(e,n,t){return e.getLineMinColumn(n)}getViewLineMaxColumn(e,n,t){return e.getLineMaxColumn(n)}getViewLineData(e,n,t){const i=e.tokenization.getLineTokens(n),r=i.getLineContent();return new O(r,!1,1,r.length+1,0,i.inflate(),null)}getViewLinesData(e,n,t,i,r,l,m){if(!l[r]){m[r]=null;return}m[r]=this.getViewLineData(e,n,0)}getModelColumnOfViewPosition(e,n){return n}getViewPositionOfModelPosition(e,n){return new k(e,n)}getViewLineNumberOfModelPosition(e,n){return e}normalizePosition(e,n,t){return n}getInjectedTextAt(e,n){return null}}class h{static INSTANCE=new h;constructor(){}isVisible(){return!1}setVisible(e){return e?w.INSTANCE:this}getProjectionData(){return null}getViewLineCount(){return 0}getViewLineContent(e,n,t){throw new Error("Not supported")}getViewLineLength(e,n,t){throw new Error("Not supported")}getViewLineMinColumn(e,n,t){throw new Error("Not supported")}getViewLineMaxColumn(e,n,t){throw new Error("Not supported")}getViewLineData(e,n,t){throw new Error("Not supported")}getViewLinesData(e,n,t,i,r,l,m){throw new Error("Not supported")}getModelColumnOfViewPosition(e,n){throw new Error("Not supported")}getViewPositionOfModelPosition(e,n){throw new Error("Not supported")}getViewLineNumberOfModelPosition(e,n){throw new Error("Not supported")}normalizePosition(e,n,t){throw new Error("Not supported")}getInjectedTextAt(e,n){throw new Error("Not supported")}}const M=[""];function T(p){if(p>=M.length)for(let e=1;e<=p;e++)M[e]=W(e);return M[p]}function W(p){return new Array(p+1).join(" ")}export{X as createModelLineProjection};
