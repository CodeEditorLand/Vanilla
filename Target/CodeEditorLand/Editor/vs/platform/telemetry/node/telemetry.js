import*as o from"fs";import{join as r}from"../../../base/common/path.js";import{Promises as d}from"../../../base/node/pfs.js";async function u(f,t){const m=Object.create(null),n=(s,c)=>{const i=JSON.parse(s);m[c]=i};if(t){const s=[],c=await d.readdir(t);for(const e of c)try{(await o.promises.stat(r(t,e))).isDirectory()&&s.push(e)}catch{}const i=[];for(const e of s)(await d.readdir(r(t,e))).filter(g=>g==="telemetry.json").length===1&&i.push(e);for(const e of i){const a=(await o.promises.readFile(r(t,e,"telemetry.json"))).toString();n(a,e)}}let l=(await o.promises.readFile(r(f,"telemetry-core.json"))).toString();return n(l,"vscode-core"),l=(await o.promises.readFile(r(f,"telemetry-extensions.json"))).toString(),n(l,"vscode-extensions"),JSON.stringify(m,null,4)}export{u as buildTelemetryMessage};
