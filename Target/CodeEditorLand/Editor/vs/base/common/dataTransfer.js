import{distinct as f}from"../../../vs/base/common/arrays.js";import{Iterable as u}from"../../../vs/base/common/iterator.js";import"../../../vs/base/common/uri.js";import{generateUuid as g}from"../../../vs/base/common/uuid.js";function h(t){return{asString:async()=>t,asFile:()=>{},value:typeof t=="string"?t:void 0}}function b(t,e,r){const n={id:g(),name:t,uri:e,data:r};return{asString:async()=>"",asFile:()=>n,value:void 0}}class T{_entries=new Map;get size(){let e=0;for(const r of this._entries)e++;return e}has(e){return this._entries.has(this.toKey(e))}matches(e){const r=[...this._entries.keys()];return u.some(this,([n,s])=>s.asFile())&&r.push("files"),a(i(e),r)}get(e){return this._entries.get(this.toKey(e))?.[0]}append(e,r){const n=this._entries.get(e);n?n.push(r):this._entries.set(this.toKey(e),[r])}replace(e,r){this._entries.set(this.toKey(e),[r])}delete(e){this._entries.delete(this.toKey(e))}*[Symbol.iterator](){for(const[e,r]of this._entries)for(const n of r)yield[e,n]}toKey(e){return i(e)}}function i(t){return t.toLowerCase()}function D(t,e){return a(i(t),e.map(i))}function a(t,e){if(t==="*/*")return e.length>0;if(e.includes(t))return!0;const r=t.match(/^([a-z]+)\/([a-z]+|\*)$/i);if(!r)return!1;const[n,s,o]=r;return o==="*"?e.some(l=>l.startsWith(s+"/")):!1}const m=Object.freeze({create:t=>f(t.map(e=>e.toString())).join(`\r
`),split:t=>t.split(`\r
`),parse:t=>m.split(t).filter(e=>!e.startsWith("#"))});export{m as UriList,T as VSDataTransfer,b as createFileDataTransferItem,h as createStringDataTransferItem,D as matchesMimeType};
