function T(n,o){const e=l(n,o);if(e!==-1)return n[e]}function l(n,o,e=n.length-1){for(let t=e;t>=0;t--){const i=n[t];if(o(i))return t}return-1}function c(n,o){const e=u(n,o);return e===-1?void 0:n[e]}function u(n,o,e=0,t=n.length){let i=e,r=t;for(;i<r;){const d=Math.floor((i+r)/2);o(n[d])?i=d+1:r=d}return i-1}function x(n,o){const e=f(n,o);return e===n.length?void 0:n[e]}function f(n,o,e=0,t=n.length){let i=e,r=t;for(;i<r;){const d=Math.floor((i+r)/2);o(n[d])?r=d:i=d+1}return i}function m(n,o,e=0,t=n.length){const i=f(n,o,e,t);return i===n.length?-1:i}class s{constructor(o){this._array=o}static assertInvariants=!1;_findLastMonotonousLastIdx=0;_prevFindLastPredicate;findLastMonotonous(o){if(s.assertInvariants){if(this._prevFindLastPredicate){for(const t of this._array)if(this._prevFindLastPredicate(t)&&!o(t))throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.")}this._prevFindLastPredicate=o}const e=u(this._array,o,this._findLastMonotonousLastIdx);return this._findLastMonotonousLastIdx=e+1,e===-1?void 0:this._array[e]}}function a(n,o){if(n.length===0)return;let e=n[0];for(let t=1;t<n.length;t++){const i=n[t];o(i,e)>0&&(e=i)}return e}function p(n,o){if(n.length===0)return;let e=n[0];for(let t=1;t<n.length;t++){const i=n[t];o(i,e)>=0&&(e=i)}return e}function h(n,o){return a(n,(e,t)=>-o(e,t))}function b(n,o){if(n.length===0)return-1;let e=0;for(let t=1;t<n.length;t++){const i=n[t];o(i,n[e])>0&&(e=t)}return e}function L(n,o){for(const e of n){const t=o(e);if(t!==void 0)return t}}export{s as MonotonousArray,m as findFirstIdxMonotonous,f as findFirstIdxMonotonousOrArrLen,a as findFirstMax,h as findFirstMin,x as findFirstMonotonous,T as findLast,l as findLastIdx,u as findLastIdxMonotonous,p as findLastMax,c as findLastMonotonous,b as findMaxIdx,L as mapFindFirst};
