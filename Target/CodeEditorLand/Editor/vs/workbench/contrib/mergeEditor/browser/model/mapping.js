import{compareBy as h,lastOrDefault as f,numberComparator as N}from"../../../../../../vs/base/common/arrays.js";import{findLast as M}from"../../../../../../vs/base/common/arraysFind.js";import{assertFn as w,checkAdjacentItems as x}from"../../../../../../vs/base/common/assert.js";import{BugIndicatingError as E}from"../../../../../../vs/base/common/errors.js";import"../../../../../../vs/editor/common/core/position.js";import{Range as s}from"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/common/model.js";import{addLength as j,lengthBetweenPositions as C,rangeContainsPosition as I,rangeIsBeforeOrTouching as y}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/rangeUtils.js";import{concatArrays as P}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/utils.js";import{LineRangeEdit as T}from"./editing.js";import{LineRange as l}from"./lineRange.js";class p{constructor(n,e){this.inputRange=n;this.outputRange=e}static join(n){return n.reduce((e,t)=>e?e.join(t):t,void 0)}extendInputRange(n){if(!n.containsRange(this.inputRange))throw new E;const e=n.startLineNumber-this.inputRange.startLineNumber,t=n.endLineNumberExclusive-this.inputRange.endLineNumberExclusive;return new p(n,new l(this.outputRange.startLineNumber+e,this.outputRange.lineCount-e+t))}join(n){return new p(this.inputRange.join(n.inputRange),this.outputRange.join(n.outputRange))}get resultingDeltaFromOriginalToModified(){return this.outputRange.endLineNumberExclusive-this.inputRange.endLineNumberExclusive}toString(){return`${this.inputRange.toString()} -> ${this.outputRange.toString()}`}addOutputLineDelta(n){return new p(this.inputRange,this.outputRange.delta(n))}addInputLineDelta(n){return new p(this.inputRange.delta(n),this.outputRange)}reverse(){return new p(this.outputRange,this.inputRange)}}class c{constructor(n,e){this.lineRangeMappings=n;this.inputLineCount=e;w(()=>x(n,(t,i)=>t.inputRange.isBefore(i.inputRange)&&t.outputRange.isBefore(i.outputRange)&&i.inputRange.startLineNumber-t.inputRange.endLineNumberExclusive===i.outputRange.startLineNumber-t.outputRange.endLineNumberExclusive))}static betweenOutputs(n,e,t){const a=m.compute(n,e).map(o=>new p(o.output1Range,o.output2Range));return new c(a,t)}project(n){const e=M(this.lineRangeMappings,a=>a.inputRange.startLineNumber<=n);if(!e)return new p(new l(n,1),new l(n,1));if(e.inputRange.contains(n))return e;const t=new l(n,1),i=new l(n+e.outputRange.endLineNumberExclusive-e.inputRange.endLineNumberExclusive,1);return new p(t,i)}get outputLineCount(){const n=f(this.lineRangeMappings),e=n?n.outputRange.endLineNumberExclusive-n.inputRange.endLineNumberExclusive:0;return this.inputLineCount+e}reverse(){return new c(this.lineRangeMappings.map(n=>n.reverse()),this.outputLineCount)}}class m{constructor(n,e,t,i,a){this.inputRange=n;this.output1Range=e;this.output1LineMappings=t;this.output2Range=i;this.output2LineMappings=a}static compute(n,e){const t=h(u=>u.inputRange.startLineNumber,N),i=P(n.map(u=>({source:0,diff:u})),e.map(u=>({source:1,diff:u}))).sort(h(u=>u.diff,t)),a=[new Array,new Array],o=[0,0],L=new Array;function b(u){const R=p.join(a[0])||new p(u,u.delta(o[0])),D=p.join(a[1])||new p(u,u.delta(o[1]));L.push(new m(r,R.extendInputRange(r).outputRange,a[0],D.extendInputRange(r).outputRange,a[1])),a[0]=[],a[1]=[]}let r;for(const u of i){const R=u.diff.inputRange;r&&!r.touches(R)&&(b(r),r=void 0),o[u.source]=u.diff.resultingDeltaFromOriginalToModified,r=r?r.join(R):R,a[u.source].push(u.diff)}return r&&b(r),L}toString(){return`${this.output1Range} <- ${this.inputRange} -> ${this.output2Range}`}}class d extends p{constructor(e,t,i,a,o){super(e,i);this.inputTextModel=t;this.outputTextModel=a;this.rangeMappings=o||[new g(this.inputRange.toRange(),this.outputRange.toRange())]}static join(e){return e.reduce((t,i)=>t?t.join(i):i,void 0)}rangeMappings;addOutputLineDelta(e){return new d(this.inputRange,this.inputTextModel,this.outputRange.delta(e),this.outputTextModel,this.rangeMappings.map(t=>t.addOutputLineDelta(e)))}addInputLineDelta(e){return new d(this.inputRange.delta(e),this.inputTextModel,this.outputRange,this.outputTextModel,this.rangeMappings.map(t=>t.addInputLineDelta(e)))}join(e){return new d(this.inputRange.join(e.inputRange),this.inputTextModel,this.outputRange.join(e.outputRange),this.outputTextModel)}getLineEdit(){return new T(this.inputRange,this.getOutputLines())}getReverseLineEdit(){return new T(this.outputRange,this.getInputLines())}getOutputLines(){return this.outputRange.getLines(this.outputTextModel)}getInputLines(){return this.inputRange.getLines(this.inputTextModel)}}class g{constructor(n,e){this.inputRange=n;this.outputRange=e}toString(){function n(e){return`[${e.startLineNumber}:${e.startColumn}, ${e.endLineNumber}:${e.endColumn})`}return`${n(this.inputRange)} -> ${n(this.outputRange)}`}addOutputLineDelta(n){return new g(this.inputRange,new s(this.outputRange.startLineNumber+n,this.outputRange.startColumn,this.outputRange.endLineNumber+n,this.outputRange.endColumn))}addInputLineDelta(n){return new g(new s(this.inputRange.startLineNumber+n,this.inputRange.startColumn,this.inputRange.endLineNumber+n,this.inputRange.endColumn),this.outputRange)}reverse(){return new g(this.outputRange,this.inputRange)}}class v{constructor(n,e){this.rangeMappings=n;this.inputLineCount=e;w(()=>x(n,(t,i)=>y(t.inputRange,i.inputRange)&&y(t.outputRange,i.outputRange)))}project(n){const e=M(this.rangeMappings,a=>a.inputRange.getStartPosition().isBeforeOrEqual(n));if(!e)return new g(s.fromPositions(n,n),s.fromPositions(n,n));if(I(e.inputRange,n))return e;const t=C(e.inputRange.getEndPosition(),n),i=j(e.outputRange.getEndPosition(),t);return new g(s.fromPositions(n),s.fromPositions(i))}projectRange(n){const e=this.project(n.getStartPosition()),t=this.project(n.getEndPosition());return new g(e.inputRange.plusRange(t.inputRange),e.outputRange.plusRange(t.outputRange))}get outputLineCount(){const n=f(this.rangeMappings),e=n?n.outputRange.endLineNumber-n.inputRange.endLineNumber:0;return this.inputLineCount+e}reverse(){return new v(this.rangeMappings.map(n=>n.reverse()),this.outputLineCount)}}export{d as DetailedLineRangeMapping,c as DocumentLineRangeMap,v as DocumentRangeMap,p as LineRangeMapping,m as MappingAlignment,g as RangeMapping};