import{Lazy as B}from"./lazy.js";import*as s from"./stream.js";const c=typeof Buffer<"u",S=new B(()=>new Uint8Array(256));let l,d;class a{static alloc(e){return c?new a(Buffer.allocUnsafe(e)):new a(new Uint8Array(e))}static wrap(e){return c&&!Buffer.isBuffer(e)&&(e=Buffer.from(e.buffer,e.byteOffset,e.byteLength)),new a(e)}static fromString(e,t){return!(t?.dontUseNodeBuffer||!1)&&c?new a(Buffer.from(e)):(l||(l=new TextEncoder),new a(l.encode(e)))}static fromByteArray(e){const t=a.alloc(e.length);for(let f=0,i=e.length;f<i;f++)t.buffer[f]=e[f];return t}static concat(e,t){if(typeof t>"u"){t=0;for(let o=0,b=e.length;o<b;o++)t+=e[o].byteLength}const f=a.alloc(t);let i=0;for(let o=0,b=e.length;o<b;o++){const n=e[o];f.set(n,i),i+=n.byteLength}return f}buffer;byteLength;constructor(e){this.buffer=e,this.byteLength=this.buffer.byteLength}clone(){const e=a.alloc(this.byteLength);return e.set(this),e}toString(){return c?this.buffer.toString():(d||(d=new TextDecoder),d.decode(this.buffer))}slice(e,t){return new a(this.buffer.subarray(e,t))}set(e,t){if(e instanceof a)this.buffer.set(e.buffer,t);else if(e instanceof Uint8Array)this.buffer.set(e,t);else if(e instanceof ArrayBuffer)this.buffer.set(new Uint8Array(e),t);else if(ArrayBuffer.isView(e))this.buffer.set(new Uint8Array(e.buffer,e.byteOffset,e.byteLength),t);else throw new Error("Unknown argument 'array'")}readUInt32BE(e){return h(this.buffer,e)}writeUInt32BE(e,t){U(this.buffer,e,t)}readUInt32LE(e){return x(this.buffer,e)}writeUInt32LE(e,t){p(this.buffer,e,t)}readUInt8(e){return w(this.buffer,e)}writeUInt8(e,t){V(this.buffer,e,t)}indexOf(e,t=0){return y(this.buffer,e instanceof a?e.buffer:e,t)}}function y(r,e,t=0){const f=e.byteLength,i=r.byteLength;if(f===0)return 0;if(f===1)return r.indexOf(e[0]);if(f>i-t)return-1;const o=S.value;o.fill(e.length);for(let m=0;m<e.length;m++)o[e[m]]=e.length-m-1;let b=t+e.length-1,n=b,u=-1;for(;b<i;)if(r[b]===e[n]){if(n===0){u=b;break}b--,n--}else b+=Math.max(e.length-n,o[r[b]]),n=e.length-1;return u}function E(r,e){return r[e+0]<<0>>>0|r[e+1]<<8>>>0}function I(r,e,t){r[t+0]=e&255,e=e>>>8,r[t+1]=e&255}function h(r,e){return r[e]*2**24+r[e+1]*2**16+r[e+2]*2**8+r[e+3]}function U(r,e,t){r[t+3]=e,e=e>>>8,r[t+2]=e,e=e>>>8,r[t+1]=e,e=e>>>8,r[t]=e}function x(r,e){return r[e+0]<<0>>>0|r[e+1]<<8>>>0|r[e+2]<<16>>>0|r[e+3]<<24>>>0}function p(r,e,t){r[t+0]=e&255,e=e>>>8,r[t+1]=e&255,e=e>>>8,r[t+2]=e&255,e=e>>>8,r[t+3]=e&255}function w(r,e){return r[e]}function V(r,e,t){r[t]=e}function T(r){return s.consumeReadable(r,e=>a.concat(e))}function O(r){return s.toReadable(r)}function A(r){return s.consumeStream(r,e=>a.concat(e))}async function W(r){return r.ended?a.concat(r.buffer):a.concat([...r.buffer,await A(r.stream)])}function k(r){return s.toStream(r,e=>a.concat(e))}function N(r){return s.transform(r,{data:e=>typeof e=="string"?a.fromString(e):a.wrap(e)},e=>a.concat(e))}function D(r){return s.newWriteableStream(e=>a.concat(e),r)}function M(r,e){return s.prefixedReadable(r,e,t=>a.concat(t))}function P(r,e){return s.prefixedStream(r,e,t=>a.concat(t))}function j(r){let e=0,t=0,f=0;const i=new Uint8Array(Math.floor(r.length/4*3)),o=n=>{switch(t){case 3:i[f++]=e|n,t=0;break;case 2:i[f++]=e|n>>>2,e=n<<6,t=3;break;case 1:i[f++]=e|n>>>4,e=n<<4,t=2;break;default:e=n<<2,t=1}};for(let n=0;n<r.length;n++){const u=r.charCodeAt(n);if(u>=65&&u<=90)o(u-65);else if(u>=97&&u<=122)o(u-97+26);else if(u>=48&&u<=57)o(u-48+52);else if(u===43||u===45)o(62);else if(u===47||u===95)o(63);else{if(u===61)break;throw new SyntaxError(`Unexpected base64 character ${r[n]}`)}}const b=f;for(;t>0;)o(0);return a.wrap(i).slice(0,b)}const g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",R="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";function z({buffer:r},e=!0,t=!1){const f=t?R:g;let i="";const o=r.byteLength%3;let b=0;for(;b<r.byteLength-o;b+=3){const n=r[b+0],u=r[b+1],m=r[b+2];i+=f[n>>>2],i+=f[(n<<4|u>>>4)&63],i+=f[(u<<2|m>>>6)&63],i+=f[m&63]}if(o===1){const n=r[b+0];i+=f[n>>>2],i+=f[n<<4&63],e&&(i+="==")}else if(o===2){const n=r[b+0],u=r[b+1];i+=f[n>>>2],i+=f[(n<<4|u>>>4)&63],i+=f[u<<2&63],e&&(i+="=")}return i}export{a as VSBuffer,y as binaryIndexOf,O as bufferToReadable,k as bufferToStream,W as bufferedStreamToBuffer,j as decodeBase64,z as encodeBase64,D as newWriteableBufferStream,M as prefixedBufferReadable,P as prefixedBufferStream,E as readUInt16LE,h as readUInt32BE,x as readUInt32LE,w as readUInt8,T as readableToBuffer,A as streamToBuffer,N as streamToBufferReadableStream,I as writeUInt16LE,U as writeUInt32BE,p as writeUInt32LE,V as writeUInt8};
