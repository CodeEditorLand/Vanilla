import{VSBuffer as a}from"./buffer.js";import{MarshalledId as t}from"./marshallingIds.js";import{URI as s}from"./uri.js";function l(e){return JSON.stringify(e,f)}function o(e){let r=JSON.parse(e);return r=i(r),r}function f(e,r){return r instanceof RegExp?{$mid:t.Regexp,source:r.source,flags:r.flags}:r}function i(e,r=0){if(!e||r>200)return e;if(typeof e=="object"){switch(e.$mid){case t.Uri:return s.revive(e);case t.Regexp:return new RegExp(e.source,e.flags);case t.Date:return new Date(e.source)}if(e instanceof a||e instanceof Uint8Array)return e;if(Array.isArray(e))for(let n=0;n<e.length;++n)e[n]=i(e[n],r+1);else for(const n in e)Object.hasOwnProperty.call(e,n)&&(e[n]=i(e[n],r+1))}return e}export{o as parse,i as revive,l as stringify};
