import*as c from"../../../vs/base/common/arrays.js";const y=(e,n)=>e===n;function d(e=y){return(n,t)=>c.equals(n,t,e)}function T(){return(e,n)=>JSON.stringify(e)===JSON.stringify(n)}function q(){return(e,n)=>e.equals(n)}function b(e,n,t){if(t!==void 0){const r=e;return r==null||n===void 0||n===null?n===r:t(r,n)}else{const r=e;return(o,u)=>o==null||u===void 0||u===null?u===o:r(o,u)}}function a(e,n){if(e===n)return!0;if(Array.isArray(e)&&Array.isArray(n)){if(e.length!==n.length)return!1;for(let t=0;t<e.length;t++)if(!a(e[t],n[t]))return!1;return!0}if(e&&typeof e=="object"&&n&&typeof n=="object"&&Object.getPrototypeOf(e)===Object.prototype&&Object.getPrototypeOf(n)===Object.prototype){const t=e,r=n,o=Object.keys(t),u=Object.keys(r),f=new Set(u);if(o.length!==u.length)return!1;for(const i of o)if(!f.has(i)||!a(t[i],r[i]))return!1;return!0}return!1}function j(e){return JSON.stringify(l(e))}let p=0;const s=new WeakMap;function l(e){if(Array.isArray(e))return e.map(l);if(e&&typeof e=="object")if(Object.getPrototypeOf(e)===Object.prototype){const n=e,t=Object.create(null);for(const r of Object.keys(n).sort())t[r]=l(n[r]);return t}else{let n=s.get(e);return n===void 0&&(n=p++,s.set(e,n)),n+"----2b76a038c20c4bcc"}return e}export{b as equalsIfDefined,j as getStructuralKey,q as itemEquals,d as itemsEquals,T as jsonStringifyEquals,y as strictEquals,a as structuralEquals};
