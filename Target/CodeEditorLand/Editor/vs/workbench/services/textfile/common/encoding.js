import{importAMDNodeModule as m}from"../../../../../vs/amdX.js";import{isESM as U}from"../../../../../vs/base/common/amd.js";import{coalesce as y}from"../../../../../vs/base/common/arrays.js";import{VSBuffer as g}from"../../../../../vs/base/common/buffer.js";import{CancellationTokenSource as N}from"../../../../../vs/base/common/cancellation.js";import{listenStream as C,newWriteableStream as R}from"../../../../../vs/base/common/stream.js";const w="utf8",p="utf8bom",b="utf16be",f="utf16le";function ne(r){return[w,p,b,f].some(e=>e===r)}const h=[254,255],I=[255,254],S=[239,187,191],D=512,x=512,F=512*8,_=512*128;var v=(e=>(e[e.STREAM_IS_BINARY=1]="STREAM_IS_BINARY",e))(v||{});class W extends Error{constructor(n,a){super(n);this.decodeStreamErrorKind=a}}class B{constructor(e){this.iconvLiteDecoder=e}static async create(e){let n;if(e!==w)n=(await m("@vscode/iconv-lite-umd","lib/iconv-lite-umd.js")).getDecoder(E(e));else{const a=new TextDecoder;n={write(i){return a.decode(i,{stream:!0})},end(){return a.decode()}}}return new B(n)}write(e){return this.iconvLiteDecoder.write(e)}end(){return this.iconvLiteDecoder.end()}}function oe(r,e){const n=e.minBytesRequiredForDetection??e.guessEncoding?F:x;return new Promise((a,i)=>{const t=R(o=>o.join("")),l=[];let s=0,d;const c=new N,u=async()=>{try{const o=await V({buffer:g.concat(l),bytesRead:s},e.guessEncoding,e.candidateGuessEncodings);if(o.seemsBinary&&e.acceptTextOnly)throw new W("Stream is binary but only text is accepted for decoding",1);o.encoding=await e.overwriteEncoding(o.encoding),d=await B.create(o.encoding);const T=d.write(g.concat(l).buffer);t.write(T),l.length=0,s=0,a({stream:t,detected:o})}catch(o){c.cancel(),t.destroy(),i(o)}};C(r,{onData:async o=>{d?t.write(d.write(o.buffer)):(l.push(o),s+=o.byteLength,s>=n&&(r.pause(),await u(),setTimeout(()=>r.resume())))},onError:o=>t.error(o),onEnd:async()=>{d||await u(),t.end(d?.end())}},c.token)})}async function te(r,e,n){const i=(await m("@vscode/iconv-lite-umd","lib/iconv-lite-umd.js")).getEncoder(E(e),n);let t=!1,l=!1;return{read(){if(l)return null;const s=r.read();if(typeof s!="string"){if(l=!0,!t&&n?.addBOM)switch(e){case w:case p:return g.wrap(Uint8Array.from(S));case b:return g.wrap(Uint8Array.from(h));case f:return g.wrap(Uint8Array.from(I))}const d=i.end();return d&&d.length>0?(t=!0,g.wrap(d)):null}return t=!0,g.wrap(i.write(s))}}}async function ie(r){return(await m("@vscode/iconv-lite-umd","lib/iconv-lite-umd.js")).encodingExists(E(r))}function E(r){return r===p||r===null?w:r}function M(r,e){if(!r||e<h.length)return null;const n=r.readUInt8(0),a=r.readUInt8(1);if(n===h[0]&&a===h[1])return b;if(n===I[0]&&a===I[1])return f;if(e<S.length)return null;const i=r.readUInt8(2);return n===S[0]&&a===S[1]&&i===S[2]?p:null}const P=["ascii","utf-16","utf-32"];async function k(r,e){const n=await m("jschardet",U?"dist/jschardet.js":"dist/jschardet.min.js"),a=r.slice(0,_),i=K(a.buffer);e&&(e=y(e.map(s=>j(s))),e.length===0&&(e=void 0));const t=n.detect(i,e?{detectEncodings:e}:void 0);if(!t||!t.encoding)return null;const l=t.encoding.toLowerCase();return 0<=P.indexOf(l)?null:A(t.encoding)}const G={ibm866:"cp866",big5:"cp950"};function L(r){return r.replace(/[^a-zA-Z0-9]/g,"").toLowerCase()}function A(r){const e=L(r);return G[e]||e}function j(r){const e=L(r);return J[e].guessableName}function K(r){let e="";for(let n=0;n<r.length;n++)e+=String.fromCharCode(r[n]);return e}function le(r){switch(r){case"shiftjis":return"shift-jis";case"utf16le":return"utf-16le";case"utf16be":return"utf-16be";case"big5hkscs":return"big5-hkscs";case"eucjp":return"euc-jp";case"euckr":return"euc-kr";case"koi8r":return"koi8-r";case"koi8u":return"koi8-u";case"macroman":return"x-mac-roman";case"utf8bom":return"utf8";default:{const e=r.match(/windows(\d+)/);return e?"windows-"+e[1]:r}}}function V({buffer:r,bytesRead:e},n,a){let i=M(r,e),t=!1;if(i!==b&&i!==f&&r){let l=!0,s=!0,d=!1;for(let c=0;c<e&&c<D;c++){const u=c%2===1,o=r.readUInt8(c)===0;if(o&&(d=!0),l&&(u&&!o||!u&&o)&&(l=!1),s&&(u&&o||!u&&!o)&&(s=!1),o&&!l&&!s)break}d&&(l?i=f:s?i=b:t=!0)}return n&&!t&&!i&&r?k(r.slice(0,e),a).then(l=>({seemsBinary:!1,encoding:l})):{seemsBinary:t,encoding:i}}const O={utf8:{labelLong:"UTF-8",labelShort:"UTF-8",order:1,alias:"utf8bom",guessableName:"UTF-8"},utf8bom:{labelLong:"UTF-8 with BOM",labelShort:"UTF-8 with BOM",encodeOnly:!0,order:2,alias:"utf8"},utf16le:{labelLong:"UTF-16 LE",labelShort:"UTF-16 LE",order:3,guessableName:"UTF-16LE"},utf16be:{labelLong:"UTF-16 BE",labelShort:"UTF-16 BE",order:4,guessableName:"UTF-16BE"},windows1252:{labelLong:"Western (Windows 1252)",labelShort:"Windows 1252",order:5,guessableName:"windows-1252"},iso88591:{labelLong:"Western (ISO 8859-1)",labelShort:"ISO 8859-1",order:6},iso88593:{labelLong:"Western (ISO 8859-3)",labelShort:"ISO 8859-3",order:7},iso885915:{labelLong:"Western (ISO 8859-15)",labelShort:"ISO 8859-15",order:8},macroman:{labelLong:"Western (Mac Roman)",labelShort:"Mac Roman",order:9},cp437:{labelLong:"DOS (CP 437)",labelShort:"CP437",order:10},windows1256:{labelLong:"Arabic (Windows 1256)",labelShort:"Windows 1256",order:11},iso88596:{labelLong:"Arabic (ISO 8859-6)",labelShort:"ISO 8859-6",order:12},windows1257:{labelLong:"Baltic (Windows 1257)",labelShort:"Windows 1257",order:13},iso88594:{labelLong:"Baltic (ISO 8859-4)",labelShort:"ISO 8859-4",order:14},iso885914:{labelLong:"Celtic (ISO 8859-14)",labelShort:"ISO 8859-14",order:15},windows1250:{labelLong:"Central European (Windows 1250)",labelShort:"Windows 1250",order:16,guessableName:"windows-1250"},iso88592:{labelLong:"Central European (ISO 8859-2)",labelShort:"ISO 8859-2",order:17,guessableName:"ISO-8859-2"},cp852:{labelLong:"Central European (CP 852)",labelShort:"CP 852",order:18},windows1251:{labelLong:"Cyrillic (Windows 1251)",labelShort:"Windows 1251",order:19,guessableName:"windows-1251"},cp866:{labelLong:"Cyrillic (CP 866)",labelShort:"CP 866",order:20,guessableName:"IBM866"},iso88595:{labelLong:"Cyrillic (ISO 8859-5)",labelShort:"ISO 8859-5",order:21,guessableName:"ISO-8859-5"},koi8r:{labelLong:"Cyrillic (KOI8-R)",labelShort:"KOI8-R",order:22,guessableName:"KOI8-R"},koi8u:{labelLong:"Cyrillic (KOI8-U)",labelShort:"KOI8-U",order:23},iso885913:{labelLong:"Estonian (ISO 8859-13)",labelShort:"ISO 8859-13",order:24},windows1253:{labelLong:"Greek (Windows 1253)",labelShort:"Windows 1253",order:25,guessableName:"windows-1253"},iso88597:{labelLong:"Greek (ISO 8859-7)",labelShort:"ISO 8859-7",order:26,guessableName:"ISO-8859-7"},windows1255:{labelLong:"Hebrew (Windows 1255)",labelShort:"Windows 1255",order:27,guessableName:"windows-1255"},iso88598:{labelLong:"Hebrew (ISO 8859-8)",labelShort:"ISO 8859-8",order:28,guessableName:"ISO-8859-8"},iso885910:{labelLong:"Nordic (ISO 8859-10)",labelShort:"ISO 8859-10",order:29},iso885916:{labelLong:"Romanian (ISO 8859-16)",labelShort:"ISO 8859-16",order:30},windows1254:{labelLong:"Turkish (Windows 1254)",labelShort:"Windows 1254",order:31},iso88599:{labelLong:"Turkish (ISO 8859-9)",labelShort:"ISO 8859-9",order:32},windows1258:{labelLong:"Vietnamese (Windows 1258)",labelShort:"Windows 1258",order:33},gbk:{labelLong:"Simplified Chinese (GBK)",labelShort:"GBK",order:34},gb18030:{labelLong:"Simplified Chinese (GB18030)",labelShort:"GB18030",order:35},cp950:{labelLong:"Traditional Chinese (Big5)",labelShort:"Big5",order:36,guessableName:"Big5"},big5hkscs:{labelLong:"Traditional Chinese (Big5-HKSCS)",labelShort:"Big5-HKSCS",order:37},shiftjis:{labelLong:"Japanese (Shift JIS)",labelShort:"Shift JIS",order:38,guessableName:"SHIFT_JIS"},eucjp:{labelLong:"Japanese (EUC-JP)",labelShort:"EUC-JP",order:39,guessableName:"EUC-JP"},euckr:{labelLong:"Korean (EUC-KR)",labelShort:"EUC-KR",order:40,guessableName:"EUC-KR"},windows874:{labelLong:"Thai (Windows 874)",labelShort:"Windows 874",order:41},iso885911:{labelLong:"Latin/Thai (ISO 8859-11)",labelShort:"ISO 8859-11",order:42},koi8ru:{labelLong:"Cyrillic (KOI8-RU)",labelShort:"KOI8-RU",order:43},koi8t:{labelLong:"Tajik (KOI8-T)",labelShort:"KOI8-T",order:44},gb2312:{labelLong:"Simplified Chinese (GB 2312)",labelShort:"GB 2312",order:45,guessableName:"GB2312"},cp865:{labelLong:"Nordic DOS (CP 865)",labelShort:"CP 865",order:46},cp850:{labelLong:"Western European DOS (CP 850)",labelShort:"CP 850",order:47}},J=(()=>{const r={};for(const e in O)O[e].guessableName&&(r[e]=O[e]);return r})();export{W as DecodeStreamError,v as DecodeStreamErrorKind,J as GUESSABLE_ENCODINGS,O as SUPPORTED_ENCODINGS,b as UTF16be,h as UTF16be_BOM,f as UTF16le,I as UTF16le_BOM,w as UTF8,S as UTF8_BOM,p as UTF8_with_bom,M as detectEncodingByBOMFromBuffer,V as detectEncodingFromBuffer,ie as encodingExists,ne as isUTFEncoding,le as toCanonicalName,oe as toDecodeStream,te as toEncodeReadable,E as toNodeEncoding};
