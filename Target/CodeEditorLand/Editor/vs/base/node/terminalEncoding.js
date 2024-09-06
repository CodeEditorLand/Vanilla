import{exec as s}from"child_process";import{isWindows as m}from"../../../vs/base/common/platform.js";const a={437:"cp437",850:"cp850",852:"cp852",855:"cp855",857:"cp857",860:"cp860",861:"cp861",863:"cp863",865:"cp865",866:"cp866",869:"cp869",936:"cp936",1252:"cp1252"};function f(n){const e=n.replace(/[^a-zA-Z0-9]/g,"").toLowerCase();return w[e]||e}const w={ibm866:"cp866",big5:"cp950"},d="utf8";async function C(n){let e;const c=process.env.VSCODE_CLI_ENCODING;c?(n&&console.log(`Found VSCODE_CLI_ENCODING variable: ${c}`),e=Promise.resolve(c)):m?e=new Promise(r=>{n&&console.log('Running "chcp" to detect terminal encoding...'),s("chcp",(p,i,l)=>{if(i){n&&console.log(`Output from "chcp" command is: ${i}`);const g=Object.keys(a);for(const t of g)if(i.indexOf(t)>=0)return r(a[t])}return r(void 0)})}):e=new Promise(r=>{n&&console.log('Running "locale charmap" to detect terminal encoding...'),s("locale charmap",(p,i,l)=>r(i))});const o=await e;return n&&console.log(`Detected raw terminal encoding: ${o}`),!o||o.toLowerCase()==="utf-8"||o.toLowerCase()===d?d:f(o)}export{C as resolveTerminalEncoding};