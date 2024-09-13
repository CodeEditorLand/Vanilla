import{findNodeAtLocation as m,parseTree as O}from"./json.js";import{format as S,isEOL as E}from"./jsonFormatter.js";function J(n,i,r){return N(n,i,void 0,r)}function N(n,i,r,s,o){const t=i.slice(),p=O(n,[]);let e,f;for(;t.length>0&&(f=t.pop(),e=m(p,t),e===void 0&&r!==void 0);)typeof f=="string"?r={[f]:r}:r=[r];if(e)if(e.type==="object"&&typeof f=="string"&&Array.isArray(e.children)){const l=m(e,[f]);if(l!==void 0)if(r===void 0){if(!l.parent)throw new Error("Malformed AST");const g=e.children.indexOf(l.parent);let h,c=l.parent.offset+l.parent.length;if(g>0){const d=e.children[g-1];h=d.offset+d.length}else h=e.offset+1,e.children.length>1&&(c=e.children[1].offset);return u(n,{offset:h,length:c-h,content:""},s)}else return u(n,{offset:l.offset,length:l.length,content:JSON.stringify(r)},s);else{if(r===void 0)return[];const g=`${JSON.stringify(f)}: ${JSON.stringify(r)}`,h=o?o(e.children.map(d=>d.children[0].value)):e.children.length;let c;if(h>0){const d=e.children[h-1];c={offset:d.offset+d.length,length:0,content:","+g}}else e.children.length===0?c={offset:e.offset+1,length:0,content:g}:c={offset:e.offset+1,length:0,content:g+","};return u(n,c,s)}}else if(e.type==="array"&&typeof f=="number"&&Array.isArray(e.children))if(r!==void 0){const l=`${JSON.stringify(r)}`;let g;if(e.children.length===0||f===0)g={offset:e.offset+1,length:0,content:e.children.length===0?l:l+","};else{const h=f===-1||f>e.children.length?e.children.length:f,c=e.children[h-1];g={offset:c.offset+c.length,length:0,content:","+l}}return u(n,g,s)}else{const l=f,g=e.children[l];let h;if(e.children.length===1)h={offset:e.offset+1,length:e.length-2,content:""};else if(e.children.length-1===l){const c=e.children[l-1],d=c.offset+c.length,w=e.offset+e.length;h={offset:d,length:w-2-d,content:""}}else h={offset:g.offset,length:e.children[l+1].offset-g.offset,content:""};return u(n,h,s)}else throw new Error(`Can not add ${typeof f!="number"?"index":"property"} to parent of type ${e.type}`);else return r===void 0?[]:u(n,{offset:p?p.offset:0,length:p?p.length:0,content:JSON.stringify(r)},s)}function u(n,i,r){let s=a(n,i),o=i.offset,t=i.offset+i.content.length;if(i.length===0||i.content.length===0){for(;o>0&&!E(s,o-1);)o--;for(;t<s.length&&!E(s,t);)t++}const y=S(s,{offset:o,length:t-o},r);for(let e=y.length-1;e>=0;e--){const f=y[e];s=a(s,f),o=Math.min(o,f.offset),t=Math.max(t,f.offset+f.length),t+=f.content.length-f.length}const p=n.length-(s.length-t)-o;return[{offset:o,length:p,content:s.substring(o,t)}]}function a(n,i){return n.substring(0,i.offset)+i.content+n.substring(i.offset+i.length)}function A(n,i){const r=i.slice(0).sort((o,t)=>{const y=o.offset-t.offset;return y===0?o.length-t.length:y});let s=n.length;for(let o=r.length-1;o>=0;o--){const t=r[o];if(t.offset+t.length<=s)n=a(n,t);else throw new Error("Overlapping edit");s=t.offset}return n}export{a as applyEdit,A as applyEdits,J as removeProperty,N as setProperty,u as withFormatting};
