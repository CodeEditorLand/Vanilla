import{findLastIdxMonotonous as L,findLastMonotonous as b,findFirstMonotonous as y}from"../../../../base/common/arraysFind.js";import{CharCode as o}from"../../../../base/common/charCode.js";import{OffsetRange as m}from"../../core/offsetRange.js";import{Position as c}from"../../core/position.js";import{Range as h}from"../../core/range.js";import"./algorithms/diffAlgorithm.js";import{isSpace as B}from"./utils.js";class w{constructor(e,i,n){this.lines=e;this.range=i;this.considerWhitespaceChanges=n;this.firstElementOffsetByLineIdx.push(0);for(let s=this.range.startLineNumber;s<=this.range.endLineNumber;s++){let a=e[s-1],u=0;s===this.range.startLineNumber&&this.range.startColumn>1&&(u=this.range.startColumn-1,a=a.substring(u)),this.lineStartOffsets.push(u);let l=0;if(!n){const t=a.trimStart();l=a.length-t.length,a=t.trimEnd()}this.trimmedWsLengthsByLineIdx.push(l);const p=s===this.range.endLineNumber?Math.min(this.range.endColumn-1-u-l,a.length):a.length;for(let t=0;t<p;t++)this.elements.push(a.charCodeAt(t));s<this.range.endLineNumber&&(this.elements.push(10),this.firstElementOffsetByLineIdx.push(this.elements.length))}}elements=[];firstElementOffsetByLineIdx=[];lineStartOffsets=[];trimmedWsLengthsByLineIdx=[];toString(){return`Slice: "${this.text}"`}get text(){return this.getText(new m(0,this.length))}getText(e){return this.elements.slice(e.start,e.endExclusive).map(i=>String.fromCharCode(i)).join("")}getElement(e){return this.elements[e]}get length(){return this.elements.length}getBoundaryScore(e){const i=d(e>0?this.elements[e-1]:-1),n=d(e<this.elements.length?this.elements[e]:-1);if(i===7&&n===8)return 0;if(i===8)return 150;let s=0;return i!==n&&(s+=10,i===0&&n===1&&(s+=1)),s+=g(i),s+=g(n),s}translateOffset(e,i="right"){const n=L(this.firstElementOffsetByLineIdx,a=>a<=e),s=e-this.firstElementOffsetByLineIdx[n];return new c(this.range.startLineNumber+n,1+this.lineStartOffsets[n]+s+(s===0&&i==="left"?0:this.trimmedWsLengthsByLineIdx[n]))}translateRange(e){const i=this.translateOffset(e.start,"right"),n=this.translateOffset(e.endExclusive,"left");return n.isBefore(i)?h.fromPositions(n,n):h.fromPositions(i,n)}findWordContaining(e){if(e<0||e>=this.elements.length||!f(this.elements[e]))return;let i=e;for(;i>0&&f(this.elements[i-1]);)i--;let n=e;for(;n<this.elements.length&&f(this.elements[n]);)n++;return new m(i,n)}countLinesIn(e){return this.translateOffset(e.endExclusive).lineNumber-this.translateOffset(e.start).lineNumber}isStronglyEqual(e,i){return this.elements[e]===this.elements[i]}extendToFullLines(e){const i=b(this.firstElementOffsetByLineIdx,s=>s<=e.start)??0,n=y(this.firstElementOffsetByLineIdx,s=>e.endExclusive<=s)??this.elements.length;return new m(i,n)}}function f(r){return r>=o.a&&r<=o.z||r>=o.A&&r<=o.Z||r>=o.Digit0&&r<=o.Digit9}var O=(t=>(t[t.WordLower=0]="WordLower",t[t.WordUpper=1]="WordUpper",t[t.WordNumber=2]="WordNumber",t[t.End=3]="End",t[t.Other=4]="Other",t[t.Separator=5]="Separator",t[t.Space=6]="Space",t[t.LineBreakCR=7]="LineBreakCR",t[t.LineBreakLF=8]="LineBreakLF",t))(O||{});const S={0:0,1:0,2:0,3:10,4:2,5:30,6:3,7:10,8:10};function g(r){return S[r]}function d(r){return r===o.LineFeed?8:r===o.CarriageReturn?7:B(r)?6:r>=o.a&&r<=o.z?0:r>=o.A&&r<=o.Z?1:r>=o.Digit0&&r<=o.Digit9?2:r===-1?3:r===o.Comma||r===o.Semicolon?5:4}export{w as LinesSliceCharSequence};
