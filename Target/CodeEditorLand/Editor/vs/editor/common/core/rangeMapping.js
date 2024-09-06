import{findLastMonotonous as a}from"../../../../vs/base/common/arraysFind.js";import"../../../../vs/editor/common/core/position.js";import{Range as g}from"../../../../vs/editor/common/core/range.js";import{TextLength as p}from"../../../../vs/editor/common/core/textLength.js";class e{constructor(i){this.mappings=i}mapPosition(i){const n=a(this.mappings,s=>s.original.getStartPosition().isBeforeOrEqual(i));if(!n)return o.position(i);if(n.original.containsPosition(i))return o.range(n.modified);const t=p.betweenPositions(n.original.getEndPosition(),i);return o.position(t.addToPosition(n.modified.getEndPosition()))}mapRange(i){const n=this.mapPosition(i.getStartPosition()),t=this.mapPosition(i.getEndPosition());return g.fromPositions(n.range?.getStartPosition()??n.position,t.range?.getEndPosition()??t.position)}reverse(){return new e(this.mappings.map(i=>i.reverse()))}}class r{constructor(i,n){this.original=i;this.modified=n}reverse(){return new r(this.modified,this.original)}toString(){return`${this.original.toString()} -> ${this.modified.toString()}`}}class o{constructor(i,n){this.position=i;this.range=n}static position(i){return new o(i,void 0)}static range(i){return new o(void 0,i)}}export{o as PositionOrRange,e as RangeMapping,r as SingleRangeMapping};
