import*as p from"https";import{streamToBuffer as u}from"../../../base/common/buffer.js";import{CancellationToken as m}from"../../../base/common/cancellation.js";import{AbstractOneDataSystemAppender as c}from"../common/1dsAppender.js";async function y(t,e){const s=await e.request(t,m.None),o=(await u(s.stream)).toString(),r=s.res.statusCode??200;return{headers:s.res.headers,statusCode:r,responseData:o}}async function h(t){const e={method:t.type,headers:t.headers};return new Promise((o,r)=>{const n=p.request(t.url??"",e,a=>{a.on("data",i=>{o({headers:a.headers,statusCode:a.statusCode??200,responseData:i.toString()})}),a.on("error",i=>{r(i)})});n.write(t.data,a=>{a&&r(a)}),n.end()})}async function g(t,e,s){const o=typeof e.data=="string"?e.data:new TextDecoder().decode(e.data),r={type:"POST",headers:{...e.headers,"Content-Type":"application/json","Content-Length":Buffer.byteLength(e.data).toString()},url:e.urlString,data:o};try{const n=t?await y(r,t):await h(r);s(n.statusCode,n.headers,n.responseData)}catch{s(0,{})}}class q extends c{constructor(e,s,o,r,n){const a={sendPOST:(i,d)=>{g(e,i,d)}};super(s,o,r,n,a)}}export{q as OneDataSystemAppender};
