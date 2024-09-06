import{VSBuffer as b}from"../../../../vs/base/common/buffer.js";import*as s from"../../../../vs/base/common/platform.js";var p=(e=>(e[e.Full=1]="Full",e[e.Delta=2]="Delta",e))(p||{});function c(n){for(let t=0,e=n.length;t<e;t+=4){const a=n[t+0],d=n[t+1],o=n[t+2],l=n[t+3];n[t+0]=l,n[t+1]=o,n[t+2]=d,n[t+3]=a}}function S(n){const t=new Uint8Array(n.buffer,n.byteOffset,n.length*4);return s.isLittleEndian()||c(t),b.wrap(t)}function g(n){const t=n.buffer;if(s.isLittleEndian()||c(t),t.byteOffset%4===0)return new Uint32Array(t.buffer,t.byteOffset,t.length/4);{const e=new Uint8Array(t.byteLength);return e.set(t),new Uint32Array(e.buffer,e.byteOffset,e.length/4)}}function D(n){const t=new Uint32Array(h(n));let e=0;if(t[e++]=n.id,n.type==="full")t[e++]=1,t[e++]=n.data.length,t.set(n.data,e),e+=n.data.length;else{t[e++]=2,t[e++]=n.deltas.length;for(const a of n.deltas)t[e++]=a.start,t[e++]=a.deleteCount,a.data?(t[e++]=a.data.length,t.set(a.data,e),e+=a.data.length):t[e++]=0}return S(t)}function h(n){let t=0;if(t+=2,n.type==="full")t+=1+n.data.length;else{t+=1,t+=3*n.deltas.length;for(const e of n.deltas)e.data&&(t+=e.data.length)}return t}function A(n){const t=g(n);let e=0;const a=t[e++];if(t[e++]===1){const r=t[e++],f=t.subarray(e,e+r);return e+=r,{id:a,type:"full",data:f}}const o=t[e++],l=[];for(let r=0;r<o;r++){const f=t[e++],y=t[e++],i=t[e++];let u;i>0&&(u=t.subarray(e,e+i),e+=i),l[r]={start:f,deleteCount:y,data:u}}return{id:a,type:"delta",deltas:l}}export{A as decodeSemanticTokensDto,D as encodeSemanticTokensDto};
