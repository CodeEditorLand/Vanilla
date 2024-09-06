import{BugIndicatingError as u}from"../../../../vs/base/common/errors.js";class i{constructor(t,e){this.start=t;this.endExclusive=e;if(t>e)throw new u(`Invalid range: ${this.toString()}`)}static addRange(t,e){let s=0;for(;s<e.length&&e[s].endExclusive<t.start;)s++;let n=s;for(;n<e.length&&e[n].start<=t.endExclusive;)n++;if(s===n)e.splice(s,0,t);else{const r=Math.min(t.start,e[s].start),l=Math.max(t.endExclusive,e[n-1].endExclusive);e.splice(s,n-s,new i(r,l))}}static tryCreate(t,e){if(!(t>e))return new i(t,e)}static ofLength(t){return new i(0,t)}static ofStartAndLength(t,e){return new i(t,t+e)}get isEmpty(){return this.start===this.endExclusive}delta(t){return new i(this.start+t,this.endExclusive+t)}deltaStart(t){return new i(this.start+t,this.endExclusive)}deltaEnd(t){return new i(this.start,this.endExclusive+t)}get length(){return this.endExclusive-this.start}toString(){return`[${this.start}, ${this.endExclusive})`}equals(t){return this.start===t.start&&this.endExclusive===t.endExclusive}containsRange(t){return this.start<=t.start&&t.endExclusive<=this.endExclusive}contains(t){return this.start<=t&&t<this.endExclusive}join(t){return new i(Math.min(this.start,t.start),Math.max(this.endExclusive,t.endExclusive))}intersect(t){const e=Math.max(this.start,t.start),s=Math.min(this.endExclusive,t.endExclusive);if(e<=s)return new i(e,s)}intersects(t){const e=Math.max(this.start,t.start),s=Math.min(this.endExclusive,t.endExclusive);return e<s}intersectsOrTouches(t){const e=Math.max(this.start,t.start),s=Math.min(this.endExclusive,t.endExclusive);return e<=s}isBefore(t){return this.endExclusive<=t.start}isAfter(t){return this.start>=t.endExclusive}slice(t){return t.slice(this.start,this.endExclusive)}substring(t){return t.substring(this.start,this.endExclusive)}clip(t){if(this.isEmpty)throw new u(`Invalid clipping range: ${this.toString()}`);return Math.max(this.start,Math.min(this.endExclusive-1,t))}clipCyclic(t){if(this.isEmpty)throw new u(`Invalid clipping range: ${this.toString()}`);return t<this.start?this.endExclusive-(this.start-t)%this.length:t>=this.endExclusive?this.start+(t-this.start)%this.length:t}map(t){const e=[];for(let s=this.start;s<this.endExclusive;s++)e.push(t(s));return e}forEach(t){for(let e=this.start;e<this.endExclusive;e++)t(e)}}class a{_sortedRanges=[];addRange(t){let e=0;for(;e<this._sortedRanges.length&&this._sortedRanges[e].endExclusive<t.start;)e++;let s=e;for(;s<this._sortedRanges.length&&this._sortedRanges[s].start<=t.endExclusive;)s++;if(e===s)this._sortedRanges.splice(e,0,t);else{const n=Math.min(t.start,this._sortedRanges[e].start),r=Math.max(t.endExclusive,this._sortedRanges[s-1].endExclusive);this._sortedRanges.splice(e,s-e,new i(n,r))}}toString(){return this._sortedRanges.map(t=>t.toString()).join(", ")}intersectsStrict(t){let e=0;for(;e<this._sortedRanges.length&&this._sortedRanges[e].endExclusive<=t.start;)e++;return e<this._sortedRanges.length&&this._sortedRanges[e].start<t.endExclusive}intersectWithRange(t){const e=new a;for(const s of this._sortedRanges){const n=s.intersect(t);n&&e.addRange(n)}return e}intersectWithRangeLength(t){return this.intersectWithRange(t).length}get length(){return this._sortedRanges.reduce((t,e)=>t+e.length,0)}}export{i as OffsetRange,a as OffsetRangeSet};
