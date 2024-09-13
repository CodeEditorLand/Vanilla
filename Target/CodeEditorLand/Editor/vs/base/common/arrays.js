import{findFirstIdxMonotonousOrArrLen as b}from"./arraysFind.js";import{CancellationError as y}from"./errors.js";function M(t,n=0){return t[t.length-(1+n)]}function k(t){if(t.length===0)throw new Error("Invalid tail call");return[t.slice(0,t.length-1),t[t.length-1]]}function E(t,n,e=(r,o)=>r===o){if(t===n)return!0;if(!t||!n||t.length!==n.length)return!1;for(let r=0,o=t.length;r<o;r++)if(!e(t[r],n[r]))return!1;return!0}function L(t,n){const e=t.length-1;n<e&&(t[n]=t[e]),t.pop()}function S(t,n,e){return g(t.length,r=>e(t[r],n))}function g(t,n){let e=0,r=t-1;for(;e<=r;){const o=(e+r)/2|0,i=n(o);if(i<0)e=o+1;else if(i>0)r=o-1;else return o}return-(e+1)}function p(t,n,e){if(t=t|0,t>=n.length)throw new TypeError("invalid index");const r=n[Math.floor(n.length*Math.random())],o=[],i=[],s=[];for(const l of n){const u=e(l,r);u<0?o.push(l):u>0?i.push(l):s.push(l)}return t<o.length?p(t,o,e):t<o.length+s.length?s[0]:p(t-(o.length+s.length),i,e)}function O(t,n){const e=[];let r;for(const o of t.slice(0).sort(n))!r||n(r[0],o)!==0?(r=[o],e.push(r)):r.push(o);return e}function*P(t,n){let e,r;for(const o of t)r!==void 0&&n(r,o)?e.push(o):(e&&(yield e),e=[o]),r=o;e&&(yield e)}function j(t,n){for(let e=0;e<=t.length;e++)n(e===0?void 0:t[e-1],e===t.length?void 0:t[e])}function B(t,n){for(let e=0;e<t.length;e++)n(e===0?void 0:t[e-1],t[e],e+1===t.length?void 0:t[e+1])}function I(t,n,e){const r=[];function o(l,u,T){if(u===0&&T.length===0)return;const a=r[r.length-1];a&&a.start+a.deleteCount===l?(a.deleteCount+=u,a.toInsert.push(...T)):r.push({start:l,deleteCount:u,toInsert:T})}let i=0,s=0;for(;;){if(i===t.length){o(i,0,n.slice(s));break}if(s===n.length){o(i,t.length-i,[]);break}const l=t[i],u=n[s],T=e(l,u);T===0?(i+=1,s+=1):T<0?(o(i,1,[]),i+=1):T>0&&(o(i,0,[u]),s+=1)}return r}function G(t,n,e){const r=I(t,n,e),o=[],i=[];for(const s of r)o.push(...t.slice(s.start,s.start+s.deleteCount)),i.push(...s.toInsert);return{removed:o,added:i}}function q(t,n,e){if(e===0)return[];const r=t.slice(0,e).sort(n);return m(t,n,r,e,t.length),r}function N(t,n,e,r,o){return e===0?Promise.resolve([]):new Promise((i,s)=>{(async()=>{const l=t.length,u=t.slice(0,e).sort(n);for(let T=e,a=Math.min(e+r,l);T<l;T=a,a=Math.min(a+r,l)){if(T>e&&await new Promise(x=>setTimeout(x)),o&&o.isCancellationRequested)throw new y;m(t,n,u,T,a)}return u})().then(i,s)})}function m(t,n,e,r,o){for(const i=e.length;r<o;r++){const s=t[r];if(n(s,e[i-1])<0){e.pop();const l=b(e,u=>n(s,u)<0);e.splice(l,0,s)}}}function F(t){return t.filter(n=>!!n)}function U(t){let n=0;for(let e=0;e<t.length;e++)t[e]&&(t[n]=t[e],n+=1);t.length=n}function W(t,n,e){t.splice(e,0,t.splice(n,1)[0])}function _(t){return!Array.isArray(t)||t.length===0}function D(t){return Array.isArray(t)&&t.length>0}function K(t,n=e=>e){const e=new Set;return t.filter(r=>{const o=n(r);return e.has(o)?!1:(e.add(o),!0)})}function Q(t){const n=new Set;return e=>{const r=t(e);return n.has(r)?!1:(n.add(r),!0)}}function V(t,n,e=(r,o)=>r===o){let r=0;for(let o=0,i=Math.min(t.length,n.length);o<i&&e(t[o],n[o]);o++)r++;return r}function z(t,n){let e=typeof n=="number"?t:0;typeof n=="number"?e=t:(e=0,n=t);const r=[];if(e<=n)for(let o=e;o<n;o++)r.push(o);else for(let o=e;o>n;o--)r.push(o);return r}function H(t,n,e){return t.reduce((r,o)=>(r[n(o)]=e?e(o):o,r),Object.create(null))}function J(t,n){return t.push(n),()=>A(t,n)}function A(t,n){const e=t.indexOf(n);if(e>-1)return t.splice(e,1),n}function X(t,n,e){const r=t.slice(0,n),o=t.slice(n);return r.concat(e,o)}function Y(t,n){let e;if(typeof n=="number"){let r=n;e=()=>{const o=Math.sin(r++)*179426549;return o-Math.floor(o)}}else e=Math.random;for(let r=t.length-1;r>0;r-=1){const o=Math.floor(e()*(r+1)),i=t[r];t[r]=t[o],t[o]=i}}function Z(t,n){const e=t.indexOf(n);e>-1&&(t.splice(e,1),t.unshift(n))}function $(t,n){const e=t.indexOf(n);e>-1&&(t.splice(e,1),t.push(n))}function ee(t,n){for(const e of n)t.push(e)}function te(t,n){return Array.isArray(t)?t.map(n):n(t)}function ne(t){return Array.isArray(t)?t:[t]}function re(t){return t[Math.floor(Math.random()*t.length)]}function v(t,n,e){const r=h(t,n),o=t.length,i=e.length;t.length=o+i;for(let s=o-1;s>=r;s--)t[s+i]=t[s];for(let s=0;s<i;s++)t[s+r]=e[s]}function oe(t,n,e,r){const o=h(t,n);let i=t.splice(o,e);return i===void 0&&(i=[]),v(t,o,r),i}function h(t,n){return n<0?Math.max(n+t.length,0):Math.min(n,t.length)}var f;(l=>{function t(u){return u<0}l.isLessThan=t;function n(u){return u<=0}l.isLessThanOrEqual=n;function e(u){return u>0}l.isGreaterThan=e;function r(u){return u===0}l.isNeitherLessOrGreaterThan=r,l.greaterThan=1,l.lessThan=-1,l.neitherLessOrGreaterThan=0})(f||={});function ie(t,n){return(e,r)=>n(t(e),t(r))}function se(...t){return(n,e)=>{for(const r of t){const o=r(n,e);if(!f.isNeitherLessOrGreaterThan(o))return o}return f.neitherLessOrGreaterThan}}const R=(t,n)=>t-n,ue=(t,n)=>R(t?1:0,n?1:0);function le(t){return(n,e)=>-t(n,e)}class Te{constructor(n){this.items=n}firstIdx=0;lastIdx=this.items.length-1;get length(){return this.lastIdx-this.firstIdx+1}takeWhile(n){let e=this.firstIdx;for(;e<this.items.length&&n(this.items[e]);)e++;const r=e===this.firstIdx?null:this.items.slice(this.firstIdx,e);return this.firstIdx=e,r}takeFromEndWhile(n){let e=this.lastIdx;for(;e>=0&&n(this.items[e]);)e--;const r=e===this.lastIdx?null:this.items.slice(e+1,this.lastIdx+1);return this.lastIdx=e,r}peek(){if(this.length!==0)return this.items[this.firstIdx]}peekLast(){if(this.length!==0)return this.items[this.lastIdx]}dequeue(){const n=this.items[this.firstIdx];return this.firstIdx++,n}removeLast(){const n=this.items[this.lastIdx];return this.lastIdx--,n}takeCount(n){const e=this.items.slice(this.firstIdx,this.firstIdx+n);return this.firstIdx+=n,e}}class d{constructor(n){this.iterate=n}static empty=new d(n=>{});forEach(n){this.iterate(e=>(n(e),!0))}toArray(){const n=[];return this.iterate(e=>(n.push(e),!0)),n}filter(n){return new d(e=>this.iterate(r=>n(r)?e(r):!0))}map(n){return new d(e=>this.iterate(r=>e(n(r))))}some(n){let e=!1;return this.iterate(r=>(e=n(r),!e)),e}findFirst(n){let e;return this.iterate(r=>n(r)?(e=r,!1):!0),e}findLast(n){let e;return this.iterate(r=>(n(r)&&(e=r),!0)),e}findLastMaxBy(n){let e,r=!0;return this.iterate(o=>((r||f.isGreaterThan(n(o,e)))&&(r=!1,e=o),!0)),e}}class c{constructor(n){this._indexMap=n}static createSortPermutation(n,e){const r=Array.from(n.keys()).sort((o,i)=>e(n[o],n[i]));return new c(r)}apply(n){return n.map((e,r)=>n[this._indexMap[r]])}inverse(){const n=this._indexMap.slice();for(let e=0;e<this._indexMap.length;e++)n[this._indexMap[e]]=e;return new c(n)}}async function ae(t,n){return(await Promise.all(t.map(async(r,o)=>({element:r,ok:await n(r,o)})))).find(r=>r.ok)?.element}export{Te as ArrayQueue,d as CallbackIterable,f as CompareResult,c as Permutation,X as arrayInsert,ne as asArray,S as binarySearch,g as binarySearch2,ue as booleanComparator,F as coalesce,U as coalesceInPlace,V as commonPrefixLength,ie as compareBy,G as delta,K as distinct,E as equals,ae as findAsync,j as forEachAdjacent,B as forEachWithNeighbors,re as getRandomElement,P as groupAdjacentBy,O as groupBy,H as index,J as insert,v as insertInto,_ as isFalsyOrEmpty,D as isNonEmptyArray,te as mapArrayOrNot,W as move,R as numberComparator,ee as pushMany,$ as pushToEnd,Z as pushToStart,p as quickSelect,z as range,A as remove,L as removeFastWithoutKeepingOrder,le as reverseOrder,Y as shuffle,I as sortedDiff,oe as splice,M as tail,k as tail2,se as tieBreakComparators,q as top,N as topAsync,Q as uniqueFilter};
