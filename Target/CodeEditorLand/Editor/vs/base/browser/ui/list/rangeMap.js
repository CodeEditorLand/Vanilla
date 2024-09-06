import{Range as p}from"../../../../../vs/base/common/range.js";function g(o,e){const n=[];for(const r of e){if(o.start>=r.range.end)continue;if(o.end<r.range.start)break;const t=p.intersect(o,r.range);p.isEmpty(t)||n.push({range:t,size:r.size})}return n}function c({start:o,end:e},n){return{start:o+n,end:e+n}}function m(o){const e=[];let n=null;for(const r of o){const t=r.range.start,s=r.range.end,i=r.size;if(n&&i===n.size){n.range.end=s;continue}n={range:{start:t,end:s},size:i},e.push(n)}return e}function f(...o){return m(o.reduce((e,n)=>e.concat(n),[]))}class b{groups=[];_size=0;_paddingTop=0;get paddingTop(){return this._paddingTop}set paddingTop(e){this._size=this._size+e-this._paddingTop,this._paddingTop=e}constructor(e){this._paddingTop=e??0,this._size=this._paddingTop}splice(e,n,r=[]){const t=r.length-n,s=g({start:0,end:e},this.groups),i=g({start:e+n,end:Number.POSITIVE_INFINITY},this.groups).map(u=>({range:c(u.range,t),size:u.size})),d=r.map((u,a)=>({range:{start:e+a,end:e+a+1},size:u.size}));this.groups=f(s,d,i),this._size=this._paddingTop+this.groups.reduce((u,a)=>u+a.size*(a.range.end-a.range.start),0)}get count(){const e=this.groups.length;return e?this.groups[e-1].range.end:0}get size(){return this._size}indexAt(e){if(e<0)return-1;if(e<this._paddingTop)return 0;let n=0,r=this._paddingTop;for(const t of this.groups){const s=t.range.end-t.range.start,i=r+s*t.size;if(e<i)return n+Math.floor((e-r)/t.size);n+=s,r=i}return n}indexAfter(e){return Math.min(this.indexAt(e)+1,this.count)}positionAt(e){if(e<0)return-1;let n=0,r=0;for(const t of this.groups){const s=t.range.end-t.range.start,i=r+s;if(e<i)return this._paddingTop+n+(e-r)*t.size;n+=s*t.size,r=i}return-1}}export{b as RangeMap,m as consolidate,g as groupIntersect,c as shift};
