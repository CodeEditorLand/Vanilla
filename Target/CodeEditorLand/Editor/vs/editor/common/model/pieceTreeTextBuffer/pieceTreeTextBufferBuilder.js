import{CharCode as f}from"../../../../base/common/charCode.js";import"../../../../base/common/lifecycle.js";import*as s from"../../../../base/common/strings.js";import{DefaultEndOfLine as p}from"../../model.js";import{createLineStarts as _,createLineStartsFast as u,StringBuffer as l}from"./pieceTreeBase.js";import{PieceTreeTextBuffer as C}from"./pieceTreeTextBuffer.js";class m{constructor(t,i,e,n,r,o,a,h,v){this._chunks=t;this._bom=i;this._cr=e;this._lf=n;this._crlf=r;this._containsRTL=o;this._containsUnusualLineTerminators=a;this._isBasicASCII=h;this._normalizeEOL=v}_getEOL(t){const i=this._cr+this._lf+this._crlf,e=this._cr+this._crlf;return i===0?t===p.LF?`
`:`\r
`:e>i/2?`\r
`:`
`}create(t){const i=this._getEOL(t),e=this._chunks;if(this._normalizeEOL&&(i===`\r
`&&(this._cr>0||this._lf>0)||i===`
`&&(this._cr>0||this._crlf>0)))for(let r=0,o=e.length;r<o;r++){const a=e[r].buffer.replace(/\r\n|\r|\n/g,i),h=u(a);e[r]=new l(a,h)}const n=new C(e,this._bom,i,this._containsRTL,this._containsUnusualLineTerminators,this._isBasicASCII,this._normalizeEOL);return{textBuffer:n,disposable:n}}getFirstLineText(t){return this._chunks[0].buffer.substr(0,t).split(/\r\n|\r|\n/)[0]}}class y{chunks;BOM;_hasPreviousChar;_previousChar;_tmpLineStarts;cr;lf;crlf;containsRTL;containsUnusualLineTerminators;isBasicASCII;constructor(){this.chunks=[],this.BOM="",this._hasPreviousChar=!1,this._previousChar=0,this._tmpLineStarts=[],this.cr=0,this.lf=0,this.crlf=0,this.containsRTL=!1,this.containsUnusualLineTerminators=!1,this.isBasicASCII=!0}acceptChunk(t){if(t.length===0)return;this.chunks.length===0&&s.startsWithUTF8BOM(t)&&(this.BOM=s.UTF8_BOM_CHARACTER,t=t.substr(1));const i=t.charCodeAt(t.length-1);i===f.CarriageReturn||i>=55296&&i<=56319?(this._acceptChunk1(t.substr(0,t.length-1),!1),this._hasPreviousChar=!0,this._previousChar=i):(this._acceptChunk1(t,!1),this._hasPreviousChar=!1,this._previousChar=i)}_acceptChunk1(t,i){!i&&t.length===0||(this._hasPreviousChar?this._acceptChunk2(String.fromCharCode(this._previousChar)+t):this._acceptChunk2(t))}_acceptChunk2(t){const i=_(this._tmpLineStarts,t);this.chunks.push(new l(t,i.lineStarts)),this.cr+=i.cr,this.lf+=i.lf,this.crlf+=i.crlf,i.isBasicASCII||(this.isBasicASCII=!1,this.containsRTL||(this.containsRTL=s.containsRTL(t)),this.containsUnusualLineTerminators||(this.containsUnusualLineTerminators=s.containsUnusualLineTerminators(t)))}finish(t=!0){return this._finish(),new m(this.chunks,this.BOM,this.cr,this.lf,this.crlf,this.containsRTL,this.containsUnusualLineTerminators,this.isBasicASCII,t)}_finish(){if(this.chunks.length===0&&this._acceptChunk1("",!0),this._hasPreviousChar){this._hasPreviousChar=!1;const t=this.chunks[this.chunks.length-1];t.buffer+=String.fromCharCode(this._previousChar);const i=u(t.buffer);t.lineStarts=i,this._previousChar===f.CarriageReturn&&this.cr++}}}export{y as PieceTreeTextBufferBuilder};
