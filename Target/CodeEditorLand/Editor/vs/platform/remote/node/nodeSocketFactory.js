import*as k from"net";import{NodeSocket as p}from"../../../base/parts/ipc/node/ipc.net.js";import{makeRawSocketHeaders as S}from"../common/managedSocket.js";const b=new class{supports(e){return!0}connect({host:e,port:c},i,m,t){return new Promise((s,n)=>{const o=k.createConnection({host:e,port:c},()=>{o.removeListener("error",n),o.write(S(i,m,t));const r=a=>{a.toString().indexOf(`\r
\r
`)>=0&&(o.off("data",r),s(new p(o,t)))};o.on("data",r)});o.setNoDelay(!0),o.once("error",n)})}};export{b as nodeSocketFactory};
