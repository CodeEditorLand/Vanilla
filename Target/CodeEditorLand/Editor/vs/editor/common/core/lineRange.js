import{findFirstIdxMonotonousOrArrLen as b,findLastIdxMonotonous as c,findLastMonotonous as L}from"../../../../vs/base/common/arraysFind.js";import{BugIndicatingError as o}from"../../../../vs/base/common/errors.js";import{OffsetRange as N}from"../../../../vs/editor/common/core/offsetRange.js";import{Range as d}from"../../../../vs/editor/common/core/range.js";class u{static fromRange(e){return new u(e.startLineNumber,e.endLineNumber)}static fromRangeInclusive(e){return new u(e.startLineNumber,e.endLineNumber+1)}static subtract(e,n){return n?e.startLineNumber<n.startLineNumber&&n.endLineNumberExclusive<e.endLineNumberExclusive?[new u(e.startLineNumber,n.startLineNumber),new u(n.endLineNumberExclusive,e.endLineNumberExclusive)]:n.startLineNumber<=e.startLineNumber&&e.endLineNumberExclusive<=n.endLineNumberExclusive?[]:n.endLineNumberExclusive<e.endLineNumberExclusive?[new u(Math.max(n.endLineNumberExclusive,e.startLineNumber),e.endLineNumberExclusive)]:[new u(e.startLineNumber,Math.min(n.startLineNumber,e.endLineNumberExclusive))]:[e]}static joinMany(e){if(e.length===0)return[];let n=new a(e[0].slice());for(let i=1;i<e.length;i++)n=n.getUnion(new a(e[i].slice()));return n.ranges}static join(e){if(e.length===0)throw new o("lineRanges cannot be empty");let n=e[0].startLineNumber,i=e[0].endLineNumberExclusive;for(let t=1;t<e.length;t++)n=Math.min(n,e[t].startLineNumber),i=Math.max(i,e[t].endLineNumberExclusive);return new u(n,i)}static ofLength(e,n){return new u(e,e+n)}static deserialize(e){return new u(e[0],e[1])}startLineNumber;endLineNumberExclusive;constructor(e,n){if(e>n)throw new o(`startLineNumber ${e} cannot be after endLineNumberExclusive ${n}`);this.startLineNumber=e,this.endLineNumberExclusive=n}contains(e){return this.startLineNumber<=e&&e<this.endLineNumberExclusive}get isEmpty(){return this.startLineNumber===this.endLineNumberExclusive}delta(e){return new u(this.startLineNumber+e,this.endLineNumberExclusive+e)}deltaLength(e){return new u(this.startLineNumber,this.endLineNumberExclusive+e)}get length(){return this.endLineNumberExclusive-this.startLineNumber}join(e){return new u(Math.min(this.startLineNumber,e.startLineNumber),Math.max(this.endLineNumberExclusive,e.endLineNumberExclusive))}toString(){return`[${this.startLineNumber},${this.endLineNumberExclusive})`}intersect(e){const n=Math.max(this.startLineNumber,e.startLineNumber),i=Math.min(this.endLineNumberExclusive,e.endLineNumberExclusive);if(n<=i)return new u(n,i)}intersectsStrict(e){return this.startLineNumber<e.endLineNumberExclusive&&e.startLineNumber<this.endLineNumberExclusive}overlapOrTouch(e){return this.startLineNumber<=e.endLineNumberExclusive&&e.startLineNumber<=this.endLineNumberExclusive}equals(e){return this.startLineNumber===e.startLineNumber&&this.endLineNumberExclusive===e.endLineNumberExclusive}toInclusiveRange(){return this.isEmpty?null:new d(this.startLineNumber,1,this.endLineNumberExclusive-1,Number.MAX_SAFE_INTEGER)}toExclusiveRange(){return new d(this.startLineNumber,1,this.endLineNumberExclusive,1)}mapToLineArray(e){const n=[];for(let i=this.startLineNumber;i<this.endLineNumberExclusive;i++)n.push(e(i));return n}forEach(e){for(let n=this.startLineNumber;n<this.endLineNumberExclusive;n++)e(n)}serialize(){return[this.startLineNumber,this.endLineNumberExclusive]}includes(e){return this.startLineNumber<=e&&e<this.endLineNumberExclusive}toOffsetRange(){return new N(this.startLineNumber-1,this.endLineNumberExclusive-1)}}class a{constructor(e=[]){this._normalizedRanges=e}get ranges(){return this._normalizedRanges}addRange(e){if(e.length===0)return;const n=b(this._normalizedRanges,t=>t.endLineNumberExclusive>=e.startLineNumber),i=c(this._normalizedRanges,t=>t.startLineNumber<=e.endLineNumberExclusive)+1;if(n===i)this._normalizedRanges.splice(n,0,e);else if(n===i-1){const t=this._normalizedRanges[n];this._normalizedRanges[n]=t.join(e)}else{const t=this._normalizedRanges[n].join(this._normalizedRanges[i-1]).join(e);this._normalizedRanges.splice(n,i-n,t)}}contains(e){const n=L(this._normalizedRanges,i=>i.startLineNumber<=e);return!!n&&n.endLineNumberExclusive>e}intersects(e){const n=L(this._normalizedRanges,i=>i.startLineNumber<e.endLineNumberExclusive);return!!n&&n.endLineNumberExclusive>e.startLineNumber}getUnion(e){if(this._normalizedRanges.length===0)return e;if(e._normalizedRanges.length===0)return this;const n=[];let i=0,t=0,r=null;for(;i<this._normalizedRanges.length||t<e._normalizedRanges.length;){let s=null;if(i<this._normalizedRanges.length&&t<e._normalizedRanges.length){const l=this._normalizedRanges[i],m=e._normalizedRanges[t];l.startLineNumber<m.startLineNumber?(s=l,i++):(s=m,t++)}else i<this._normalizedRanges.length?(s=this._normalizedRanges[i],i++):(s=e._normalizedRanges[t],t++);r===null?r=s:r.endLineNumberExclusive>=s.startLineNumber?r=new u(r.startLineNumber,Math.max(r.endLineNumberExclusive,s.endLineNumberExclusive)):(n.push(r),r=s)}return r!==null&&n.push(r),new a(n)}subtractFrom(e){const n=b(this._normalizedRanges,s=>s.endLineNumberExclusive>=e.startLineNumber),i=c(this._normalizedRanges,s=>s.startLineNumber<=e.endLineNumberExclusive)+1;if(n===i)return new a([e]);const t=[];let r=e.startLineNumber;for(let s=n;s<i;s++){const l=this._normalizedRanges[s];l.startLineNumber>r&&t.push(new u(r,l.startLineNumber)),r=l.endLineNumberExclusive}return r<e.endLineNumberExclusive&&t.push(new u(r,e.endLineNumberExclusive)),new a(t)}toString(){return this._normalizedRanges.map(e=>e.toString()).join(", ")}getIntersection(e){const n=[];let i=0,t=0;for(;i<this._normalizedRanges.length&&t<e._normalizedRanges.length;){const r=this._normalizedRanges[i],s=e._normalizedRanges[t],l=r.intersect(s);l&&!l.isEmpty&&n.push(l),r.endLineNumberExclusive<s.endLineNumberExclusive?i++:t++}return new a(n)}getWithDelta(e){return new a(this._normalizedRanges.map(n=>n.delta(e)))}}export{u as LineRange,a as LineRangeSet};
